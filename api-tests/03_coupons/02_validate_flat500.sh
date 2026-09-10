#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/coupons/validate code=FLAT500 amount=7500"
curl -s -X POST "$BASE_URL/api/coupons/validate" -H "$JSON_HDR" -d '{
  "code": "FLAT500",
  "amount": 7500
}' | tee /tmp/coupon_flat.json | jq . 2>/dev/null || cat /tmp/coupon_flat.json; echo
grep -q "\"valid\":true" /tmp/coupon_flat.json && pass "FLAT500 valid" || fail "FLAT500 invalid"
