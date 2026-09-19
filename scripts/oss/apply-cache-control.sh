#!/usr/bin/env bash

set -euo pipefail

bucket="oss://xanylabeling-web-prod/"
dry_run=()

if [[ "${1:-}" == "--dry-run" ]]; then
  dry_run=(--dry-run)
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--dry-run]" >&2
  exit 2
fi

common=(
  "$bucket"
  --recursive
  --force
  --quiet
  --max-age 1d
  --metadata-directive update
)

# Apply a safe default first, then override long-lived binary assets,
# content-hashed application bundles, and HTML documents.
ossutil set-props "${common[@]}" \
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
  --cache-control "public, max-age=31536000, immutable" \
  "${dry_run[@]}"

ossutil set-props "${common[@]}" \
  --include "*.html" \
  --cache-control "no-cache, max-age=0, must-revalidate" \
  "${dry_run[@]}"
