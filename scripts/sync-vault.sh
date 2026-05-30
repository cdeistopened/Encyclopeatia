#!/usr/bin/env bash
# Sync canonical vault content into the Next.js app's public/wiki.
# Vault is the source of truth. Excludes raw .research.md extraction files,
# per-dir READMEs, and internal vault dirs (_builds/_scripts/outputs/references).
# NOTE: rsync is first-match-wins — excludes MUST precede the *.md include.
set -euo pipefail
VAULT="$(cd "$(dirname "$0")/../../vault" && pwd)"
APP_WIKI="$(cd "$(dirname "$0")/../public/wiki" && pwd)"
CATEGORIES=(substances concepts conditions mechanisms people protocols practices articles)
for cat in "${CATEGORIES[@]}"; do
  [ -d "$VAULT/$cat" ] || continue
  mkdir -p "$APP_WIKI/$cat"
  rsync -a --delete --delete-excluded \
    --exclude='*.research.md' --exclude='README.md' \
    --include='*/' --include='*.md' --exclude='*' \
    "$VAULT/$cat/" "$APP_WIKI/$cat/"
done
echo "Synced ${#CATEGORIES[@]} categories."
