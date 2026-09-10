#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/spotlight/visual-search imageName=jacket-front.jpg"
curl -s -X POST "$BASE_URL/api/spotlight/visual-search" -H "$JSON_HDR" -d '{
  "imageName": "jacket-front.jpg",
  "filename": "jacket-front.jpg"
}' | tee /tmp/spot_visual.json | jq . 2>/dev/null | head -n 40; echo
grep -q "product" /tmp/spot_visual.json && pass "Visual search returned products" || fail "Visual search failed"
