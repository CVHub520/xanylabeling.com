#!/usr/bin/python3
"""Certbot DNS hooks: add a specific TXT value and delete only our own record."""
import json
import os
import sys
import time
from pathlib import Path

from cloud import rpc

DOMAINS = {"xanylabeling.com", "www.xanylabeling.com", "media.xanylabeling.com", "www.media.xanylabeling.com"}
STATE = Path("/var/lib/xanylabeling-cert-renew")


def main():
    domain = os.environ["CERTBOT_DOMAIN"]
    value = os.environ["CERTBOT_VALIDATION"]
    if domain not in DOMAINS:
        raise RuntimeError("Unexpected challenge domain")
    suffix = domain.removesuffix(".xanylabeling.com") if domain != "xanylabeling.com" else ""
    rr = "_acme-challenge" + ("." + suffix if suffix else "")
    state = STATE / ("dns-" + domain + ".json")
    if sys.argv[1] == "auth":
        result = rpc("alidns", "2015-01-09", "DescribeDomainRecords", DomainName="xanylabeling.com",
                     RRKeyWord=rr, TypeKeyWord="TXT", PageSize=100)
        matches = [r for r in result.get("DomainRecords", {}).get("Record", [])
                   if r["RR"] == rr and r["Value"].strip('"') == value]
        if matches:
            record_id, created = matches[0]["RecordId"], False
        else:
            result = rpc("alidns", "2015-01-09", "AddDomainRecord", DomainName="xanylabeling.com",
                         RR=rr, Type="TXT", Value=value, TTL=600)
            record_id, created = result["RecordId"], True
        state.write_text(json.dumps({"RecordId": record_id, "created": created, "value": value}))
        state.chmod(0o600)
        # Allow authoritative DNS and recursive caches to receive the new value.
        if os.environ.get("CERTBOT_REMAINING_CHALLENGES", "0") == "0":
            time.sleep(120)
    elif sys.argv[1] == "cleanup" and state.exists():
        saved = json.loads(state.read_text())
        if saved["created"] and saved["value"] == value:
            rpc("alidns", "2015-01-09", "DeleteDomainRecord", RecordId=saved["RecordId"])
        state.unlink()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("DNS hook failed: " + str(exc), file=sys.stderr)
        sys.exit(1)
