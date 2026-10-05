#!/usr/bin/python3
"""Deploy a valid ACME certificate to OSS/CDN, then verify public TLS."""
import hashlib
import json
import os
import socket
import ssl
import subprocess
import sys
import time
from pathlib import Path

from cloud import cdn_certificate, credentials, oss_certificate, rpc, set_cdn_certificate, set_oss_certificate

STATE = Path("/var/lib/xanylabeling-cert-renew")
LINEAGE = Path("/etc/letsencrypt/live/xanylabeling-cloud")
DOMAINS = {"xanylabeling.com", "www.xanylabeling.com", "media.xanylabeling.com", "www.media.xanylabeling.com"}


def save(name, data):
    temporary = STATE / (name + ".tmp")
    temporary.write_text(json.dumps(data, indent=2))
    temporary.chmod(0o600)
    temporary.replace(STATE / name)


def fingerprint(pem):
    leaf = pem.split("-----END CERTIFICATE-----")[0] + "-----END CERTIFICATE-----\n"
    return hashlib.sha256(ssl.PEM_cert_to_DER_cert(leaf)).hexdigest()


def live_fingerprint(domain):
    with socket.create_connection((domain, 443), timeout=15) as connection:
        with ssl.create_default_context().wrap_socket(connection, server_hostname=domain) as tls:
            return hashlib.sha256(tls.getpeercert(binary_form=True)).hexdigest()


def preflight():
    credentials()
    oss_id = oss_certificate()
    cdn = cdn_certificate()
    rpc("alidns", "2015-01-09", "DescribeDomainRecords", DomainName="xanylabeling.com", PageSize=1)
    print("Cloud access OK; OSS certificate=" + str(oss_id) + "; CDN certificate=" + str(cdn["CertId"]))


def deploy():
    metadata = ssl._ssl._test_decode_cert(str(LINEAGE / "cert.pem"))
    if {value for kind, value in metadata["subjectAltName"] if kind == "DNS"} != DOMAINS:
        raise RuntimeError("Certificate SANs do not match the configured domains")
    if ssl.cert_time_to_seconds(metadata["notAfter"]) < time.time() + 14 * 86400:
        raise RuntimeError("Certificate has fewer than 14 days remaining")
    cert_public = subprocess.check_output(["openssl", "x509", "-in", str(LINEAGE / "cert.pem"), "-pubkey", "-noout"])
    key_public = subprocess.check_output(["openssl", "pkey", "-in", str(LINEAGE / "privkey.pem"), "-pubout"])
    if cert_public != key_public:
        raise RuntimeError("Certificate and private key do not match")
    fullchain = (LINEAGE / "fullchain.pem").read_text()
    wanted = fingerprint(fullchain)
    state_file = STATE / "deployment.json"
    state = json.loads(state_file.read_text()) if state_file.exists() else {}
    if state.get("fingerprint") != wanted:
        previous = {"oss": oss_certificate(), "cdn": cdn_certificate()["CertId"]}
        # Keep the prior cloud certificate IDs available for recovery.
        save("previous-" + str(int(time.time())) + ".json", previous)
        uploaded = rpc("cas", "2020-04-07", "UploadUserCertificate",
                       Name="xanylabeling-acme-" + wanted[:12], Cert=fullchain,
                       Key=(LINEAGE / "privkey.pem").read_text())
        state = {"fingerprint": wanted, "cert_id": uploaded["CertId"], "previous": previous}
        # Persist before updates, so interrupted/partial deployment can resume.
        save("deployment.json", state)
    cert_id = str(state["cert_id"])
    oss_id = cert_id + "-cn-hangzhou"
    current_oss = oss_certificate()
    if current_oss != oss_id:
        set_oss_certificate(oss_id, current_oss)
        print("OSS certificate updated")
    if str(cdn_certificate()["CertId"]) != cert_id:
        set_cdn_certificate(cert_id)
        print("CDN certificate updated")
    for attempt in range(31):
        pending = []
        for domain in ["xanylabeling.com", "media.xanylabeling.com"]:
            try:
                if live_fingerprint(domain) != wanted:
                    pending.append(domain)
            except (OSError, ssl.SSLError):
                pending.append(domain)
        if not pending:
            state["verified_at"] = int(time.time())
            state["expires_at"] = ssl.cert_time_to_seconds(metadata["notAfter"])
            save("deployment.json", state)
            (STATE / "FAILED").unlink(missing_ok=True)
            (STATE / "FAILED-TIMER").unlink(missing_ok=True)
            print("Public TLS verified for both domains; certificate=" + cert_id)
            return
        if attempt == 30:
            raise RuntimeError("Cloud certificate propagation is still pending: " + ", ".join(pending))
        print("Waiting for public certificate propagation: " + ", ".join(pending), flush=True)
        time.sleep(20)


if __name__ == "__main__":
    os.umask(0o077)
    try:
        if len(sys.argv) > 1 and sys.argv[1] == "preflight":
            preflight()
        else:
            deploy()
    except Exception as exc:
        message = "Certificate automation failed: " + str(exc)
        save("FAILED", {"time": int(time.time()), "message": message})
        print(message, file=sys.stderr)
        sys.exit(1)
