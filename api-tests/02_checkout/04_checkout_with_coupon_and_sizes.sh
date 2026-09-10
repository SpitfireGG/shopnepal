#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/checkout with coupon WELCOME10 + multiple sizes"
curl -s -X POST "$BASE_URL/api/checkout" -H "$JSON_HDR" -d '{
  "name": "Anu Gurung",
  "phone": "9834567890",
  "email": "anu.coupon@shopnepal.test",
  "address": "Bhaktapur Durbar Square, Ward 8, Suryamadi",
  "city": "Bhaktapur",
  "state": "Bagmati",
  "postcode": "44800",
  "method": "dummy",
  "couponCode": "WELCOME10",
  "items": [
    {"id": "SHOPNEPAL-005", "qty": 1, "size": "S"},
    {"id": "SHOPNEPAL-007", "qty": 1, "size": "M"},
    {"id": "SHOPNEPAL-021", "qty": 1}
  ]
}' | tee /tmp/shopnepal_checkout_coupon.json | head -c 1000; echo
jq . /tmp/shopnepal_checkout_coupon.json 2>/dev/null | head -n 20; echo
grep -q "discount" /tmp/shopnepal_checkout_coupon.json && pass "Coupon discount applied" || warn "No discount field"
