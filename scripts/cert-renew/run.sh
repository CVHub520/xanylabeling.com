#!/bin/bash
set -euo pipefail
umask 077
exec 9>/var/lib/xanylabeling-cert-renew/run.lock
flock -n 9 || exit 0
cd /opt/xanylabeling-cert-renew
python3 deploy.py preflight
if [ ! -f /etc/letsencrypt/live/xanylabeling-cloud/cert.pem ]; then
  certbot certonly --non-interactive --agree-tos --register-unsafely-without-email \
    --manual --preferred-challenges dns --manual-auth-hook './dns-hook.py auth' \
    --manual-cleanup-hook './dns-hook.py cleanup' --cert-name xanylabeling-cloud \
    --key-type rsa --rsa-key-size 2048 \
    -d xanylabeling.com -d www.xanylabeling.com \
    -d media.xanylabeling.com -d www.media.xanylabeling.com
else
  certbot renew --cert-name xanylabeling-cloud --non-interactive --no-random-sleep-on-renew
fi
# Always reconcile deployment, including after a previous deployment failure.
python3 deploy.py
