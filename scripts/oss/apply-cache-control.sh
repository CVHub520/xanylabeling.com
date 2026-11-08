#!/usr/bin/env bash

set -euo pipefail

bucket="oss://${OSS_BUCKET:-xanylabeling-web-prod}/"
dry_run=()
age_filter=(--max-age 1d)

for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=(--dry-run) ;;
    --all) age_filter=() ;;
    *) echo "Usage: $0 [--dry-run] [--all]" >&2; exit 2 ;;
  esac
done

common=(
  "$bucket"
  --recursive
  --force
  --quiet
  "${age_filter[@]}"
  --metadata-directive update
)

# Apply a safe default first, then override long-lived binary assets,
# content-hashed application bundles, and HTML documents.
ossutil set-props "${common[@]}" \
  --exclude "*.html" \
  --exclude 'assets/js/**' --exclude 'assets/css/**' \
  --exclude 'zh-Hans/assets/js/**' --exclude 'zh-Hans/assets/css/**' \
  --cache-control "public, max-age=86400" \
  "${dry_run[@]}"

ossutil set-props "${common[@]}" \
  --include "*.avif" \
  --include "*.gif" \
  --include "*.ico" \
  --include "*.jpeg" \
  --include "*.jpg" \
  --include "*.png" \
  --include "*.svg" \
  --include "*.webp" \
  --include "*.woff" \
  --include "*.woff2" \
  --cache-control "public, max-age=2592000" \
  "${dry_run[@]}"

ossutil set-props "${common[@]}" \
  --include "assets/css/**" \
  --include "assets/js/**" \
  --include "zh-Hans/assets/css/**" \
  --include "zh-Hans/assets/js/**" \
  --cache-control "public, max-age=31536000, immutable" \
  "${dry_run[@]}"

ossutil set-props "${common[@]}" \
  --include "*.html" \
  --cache-control "no-cache, max-age=0, must-revalidate" \
  "${dry_run[@]}"
