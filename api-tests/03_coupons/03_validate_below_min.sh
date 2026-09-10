#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/coupons/validate code=WELCOME10 amount=500 (below minAmount 1000)"
curl -s -X POST "$BASE_URL/api/coupons/validate" -H "$JSON_HDR" -d '{
  "code": "WELCOME10",
  "amount": 500
}' | tee /tmp/coupon_low.json | jq . 2>/dev/null || cat /tmp/coupon_low.json; echo
grep -q "\"valid\":false" /tmp/coupon_low.json && pass "Correctly rejected low amount" || warn "Unexpected valid"
info "POST /api/coupons/validate code=INVALID99 amount=10000"
curl -s -X POST "$BASE_URL/api/coupons/validate" -H "$JSON_HDR" -d '{
  "code": "INVALID99",
  "amount": 10000
}' | jq . 2>/dev/null || true; echo
