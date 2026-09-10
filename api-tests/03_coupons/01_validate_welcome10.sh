#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/coupons/validate code=WELCOME10 amount=5000"
curl -s -X POST "$BASE_URL/api/coupons/validate" -H "$JSON_HDR" -d '{
  "code": "WELCOME10",
  "amount": 5000
}' | tee /tmp/coupon_welcome.json | jq . 2>/dev/null || cat /tmp/coupon_welcome.json; echo
grep -q "\"valid\":true" /tmp/coupon_welcome.json && pass "WELCOME10 valid" || fail "WELCOME10 invalid"
