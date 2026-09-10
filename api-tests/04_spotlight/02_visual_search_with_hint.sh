#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/spotlight/visual-search with categoryHint=shoes"
curl -s -X POST "$BASE_URL/api/spotlight/visual-search" -H "$JSON_HDR" -d '{
  "imageName": "running-shoes-white-angled.jpg",
  "categoryHint": "shoes"
}' | tee /tmp/spot_visual_hint.json | jq . 2>/dev/null | head -n 40; echo
grep -q "score" /tmp/spot_visual_hint.json && pass "Hinted visual search OK" || fail "Failed"
