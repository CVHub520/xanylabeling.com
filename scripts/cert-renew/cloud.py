"""Alibaba Cloud calls using only the ECS instance's temporary RAM credentials."""
import base64
import datetime
import email.utils
import hashlib
import hmac
import json
import urllib.parse
import uuid
import xml.etree.ElementTree as ET

import requests


def credentials():
    session = requests.Session()
    session.trust_env = False
    base = "http://100.100.100.200/latest/"
    response = session.put(base + "api/token", headers={
        "X-aliyun-ecs-metadata-token-ttl-seconds": "60"
    }, timeout=5)
    response.raise_for_status()
    headers = {"X-aliyun-ecs-metadata-token": response.text}
    response = session.get(base + "meta-data/ram/security-credentials/",
                           headers=headers, timeout=5)
    if response.status_code == 404:
        raise RuntimeError("No ECS RAM role attached; bind XAnyLabelingCertificateRenewRole")
    response.raise_for_status()
    role = response.text.strip()
    if not role or "/" in role or "\n" in role:
        raise RuntimeError("Unexpected ECS role metadata")
    response = session.get(base + "meta-data/ram/security-credentials/" + role,
                           headers=headers, timeout=5)
    response.raise_for_status()
    result = response.json()
    if result.get("Code") != "Success":
        raise RuntimeError("ECS temporary credentials are unavailable")
    return result


def rpc(service, version, action, **kwargs):
    auth = credentials()
    params = {
        "Format": "JSON", "Version": version, "AccessKeyId": auth["AccessKeyId"],
        "SecurityToken": auth["SecurityToken"], "SignatureMethod": "HMAC-SHA1",
        "Timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "SignatureVersion": "1.0", "SignatureNonce": str(uuid.uuid4()),
        "Action": action, **kwargs,
    }
    escape = lambda value: urllib.parse.quote(str(value), safe="~")
    query = "&".join(escape(k) + "=" + escape(v) for k, v in sorted(params.items()))
    signature = hmac.new((auth["AccessKeySecret"] + "&").encode(),
                         ("POST&%2F&" + escape(query)).encode(), hashlib.sha1).digest()
    params["Signature"] = base64.b64encode(signature).decode()
    response = requests.post("https://" + service + ".aliyuncs.com/", data=params, timeout=30)
    result = response.json()
    if "Code" in result:
        # Never include request parameters, certificates, or credentials in errors.
        raise RuntimeError(action + " failed: " + str(result["Code"]) +
                           " request=" + str(result.get("RequestId", "")))
    response.raise_for_status()
    return result


def oss(method, query, body=b""):
    auth = credentials()
    bucket = "xanylabeling-web-prod"
    date = email.utils.formatdate(usegmt=True)
    content_type = "application/xml" if body else ""
    md5 = base64.b64encode(hashlib.md5(body).digest()).decode() if body else ""
    canonical = (method + "\n" + md5 + "\n" + content_type + "\n" + date + "\n" +
                 "x-oss-security-token:" + auth["SecurityToken"] + "\n/" + bucket + "/?" + query)
    signature = base64.b64encode(hmac.new(auth["AccessKeySecret"].encode(),
                                          canonical.encode(), hashlib.sha1).digest()).decode()
    headers = {"Date": date, "x-oss-security-token": auth["SecurityToken"],
               "Authorization": "OSS " + auth["AccessKeyId"] + ":" + signature}
    if body:
        headers.update({"Content-Type": content_type, "Content-MD5": md5})
    response = requests.request(method, "https://" + bucket + ".oss-cn-hangzhou.aliyuncs.com/?" + query,
                                headers=headers, data=body, timeout=30)
    if not response.ok:
        try:
            code = ET.fromstring(response.content).findtext("Code")
        except ET.ParseError:
            code = str(response.status_code)
        raise RuntimeError("OSS " + method + " failed: " + str(code))
    return ET.fromstring(response.content) if response.content else None


def oss_certificate():
    result = oss("GET", "cname")
    for entry in result.findall("Cname"):
        if entry.findtext("Domain") == "xanylabeling.com":
            return entry.findtext("Certificate/CertId")
    raise RuntimeError("Expected OSS domain binding is missing")


def set_oss_certificate(cert_id, previous):
    root = ET.Element("BucketCnameConfiguration")
    cname = ET.SubElement(root, "Cname")
    ET.SubElement(cname, "Domain").text = "xanylabeling.com"
    config = ET.SubElement(cname, "CertificateConfiguration")
    ET.SubElement(config, "CertId").text = cert_id
    ET.SubElement(config, "PreviousCertId").text = previous
    ET.SubElement(config, "Force").text = "false"
    oss("POST", "cname&comp=add", ET.tostring(root))


def cdn_certificate():
    result = rpc("cdn", "2018-05-10", "DescribeDomainCertificateInfo",
                 DomainName="media.xanylabeling.com")
    return result["CertInfos"]["CertInfo"][0]


def set_cdn_certificate(cert_id):
    rpc("cdn", "2018-05-10", "SetCdnDomainSSLCertificate",
        DomainName="media.xanylabeling.com", CertType="cas", CertId=cert_id,
        CertRegion="cn-hangzhou", SSLProtocol="on")
