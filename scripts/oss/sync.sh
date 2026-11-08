#!/usr/bin/env bash

set -euo pipefail

bucket="oss://${OSS_BUCKET:-xanylabeling-web-prod}"
dry_run=()
if [[ "${1:-}" == "--dry-run" && $# -eq 1 ]]; then
  dry_run=(--dry-run)
elif [[ $# -ne 0 ]]; then
  echo "Usage: $0 [--dry-run]" >&2
  exit 2
fi

# Compress a temporary copy so the original build remains usable for local previews.
compressed_dir=$(mktemp -d)
trap 'rm -rf "$compressed_dir"' EXIT

# Publish new hashed assets first and retain older ones for open browser tabs.
for prefix in assets/js assets/css zh-Hans/assets/js zh-Hans/assets/css; do
  test -d "build/${prefix}"
  mkdir -p "${compressed_dir}/${prefix}"
  while IFS= read -r -d '' asset; do
    relative=${asset#"build/${prefix}/"}
    mkdir -p "${compressed_dir}/${prefix}/$(dirname "$relative")"
    gzip -n -9 -c "$asset" > "${compressed_dir}/${prefix}/${relative}"
  done < <(find "build/${prefix}" -type f -print0)
  content_type='application/javascript; charset=utf-8'
  if [[ "$prefix" == */css ]]; then
    content_type='text/css; charset=utf-8'
  fi
  ossutil sync "${compressed_dir}/${prefix}/" "${bucket}/${prefix}/" \
    --content-encoding gzip --content-type "$content_type" \
    --cache-control 'public, max-age=31536000, immutable' \
    --checksum --force "${dry_run[@]}"
done

ossutil sync build/ "${bucket}/" --delete --checksum --force \
  --exclude 'assets/js/**' --exclude 'assets/css/**' \
  --exclude 'zh-Hans/assets/js/**' --exclude 'zh-Hans/assets/css/**' \
  "${dry_run[@]}"
