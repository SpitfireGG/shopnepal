#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "GET /api/spotlight/stylist?anchorId=SHOPNEPAL-009&style=casual"
curl -s "$BASE_URL/api/spotlight/stylist?anchorId=SHOPNEPAL-009&style=casual" | tee /tmp/spot_stylist_casual.json | jq . 2>/dev/null | head -n 50; echo
info "GET /api/spotlight/stylist?anchorId=SHOPNEPAL-008&style=formal"
curl -s "$BASE_URL/api/spotlight/stylist?anchorId=SHOPNEPAL-008&style=formal" | tee /tmp/spot_stylist_formal.json | jq . 2>/dev/null | head -n 50; echo
info "GET /api/spotlight/stylist?anchorId=SHOPNEPAL-007&style=festive"
curl -s "$BASE_URL/api/spotlight/stylist?anchorId=SHOPNEPAL-007&style=festive" | jq . 2>/dev/null | head -n 30; echo
grep -q "bundle" /tmp/spot_stylist_casual.json && pass "Stylist bundling OK" || fail "Stylist failed"
