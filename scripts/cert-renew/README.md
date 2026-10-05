# Certificate renewal on ECS

Host: `i-bp1bht0qih1s5ahr3atl`, Hangzhou, `47.99.104.175` (Ubuntu 22.04).

Activated on `2026-10-05`. Initial staging issuance, production issuance/cloud
deployment, a simulated renewal, and a second run with a certificate not yet due
for renewal all passed. The timer is enabled and active. The initial shared cloud
certificate is `27638685-cn-hangzhou`, expiring at `2027-01-03 22:08:58`
Asia/Shanghai; subsequent renewals replace its ID automatically.

Certbot uses automated DNS-01 hooks to issue a single RSA certificate for
`xanylabeling.com`, `www.xanylabeling.com`, `media.xanylabeling.com`, and
`www.media.xanylabeling.com`. Deployment uploads the certificate to Alibaba
Cloud CAS, replaces the main domain's OSS certificate and the video's CDN
certificate, and verifies public TLS fingerprints. Existing cloud certificates
are retained for recovery. Issuance is free; Alibaba Cloud billing remains
subject to the account's current product terms.

## Credentials and permissions

Create `XAnyLabelingCertificateRenewRole` as an Alibaba Cloud service role with
ECS as the trusted service. Attach a custom policy containing `renew-policy.json`,
then bind that role to this instance. The program retrieves short-lived
credentials from the hardened ECS metadata service. It never stores AccessKeys
or prints private keys. Do not attach the website deployment policy: certificate
renewal does not need object upload/delete permissions.

## Installation paths

- Programs: `/opt/xanylabeling-cert-renew/`, root-owned, mode 0700.
- Certbot certificate/key: `/etc/letsencrypt/live/xanylabeling-cloud/`.
- Deployment and challenge state: `/var/lib/xanylabeling-cert-renew/`, mode 0700.
- Units: `/etc/systemd/system/xanylabeling-cert-renew*`.

Install the distribution's `certbot` and `python3-requests` packages. Copy the
Python programs and `run.sh` into the program directory; make `run.sh` and
`dns-hook.py` executable. Copy the unit files, create Certbot's state directories,
and run `systemctl daemon-reload`.

The generic `certbot.timer` is disabled because the dedicated timer also retries
cloud deployment after a prior failure, even when the certificate is not yet due
for renewal. No other certificates existed on the host at installation.

## Validation and activation

1. Run `/usr/bin/python3 /opt/xanylabeling-cert-renew/deploy.py preflight`.
2. Use Certbot's staging server to test the DNS hooks with separate configuration,
   work and log directories. Never deploy staging certificates.
3. Run `systemctl start xanylabeling-cert-renew.service` to issue and deploy the
   production certificate, and verify public HTTPS and a video range request.
4. Run `systemctl enable --now xanylabeling-cert-renew.timer` only after validation.

The timer checks daily at 03:00 Asia/Shanghai, with up to 15 minutes of jitter.
Certbot renews when due; the cloud reconciler runs every day. `Persistent=true`
catches a missed run after a reboot. A file lock prevents concurrent runs.

## Status and failure handling

```bash
systemctl status xanylabeling-cert-renew.timer
systemctl list-timers xanylabeling-cert-renew.timer
journalctl -u xanylabeling-cert-renew.service --since '7 days ago'
cat /var/lib/xanylabeling-cert-renew/deployment.json
```

Failures leave `FAILED` and/or `FAILED-TIMER` in the state directory, a failed
systemd unit, and an error in the system journal. The next scheduled run retries.
External email/chat alerts are not configured. Do not treat journal logging as
an external notification service.

## Recovery

Disable the timer with `systemctl disable --now xanylabeling-cert-renew.timer`.
This leaves the currently deployed cloud certificates active. If a cloud update
needs reversal, select the prior certificate IDs recorded in
`previous-<timestamp>.json` in OSS/CDN. Never delete Certbot's archive or cloud
certificates until replacement and rollback requirements have been checked.

Updating these scripts does not require a website rebuild or OSS object upload.
