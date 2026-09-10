#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/checkout method=esewa"
curl -s -X POST "$BASE_URL/api/checkout" -H "$JSON_HDR" -d '{
  "name": "Gaurav Neupane",
  "phone": "9801234567",
  "email": "gaurav.esewa@shopnepal.test",
  "address": "Pulchowk, Ward 5, Lalitpur Tole, 123 Street",
  "city": "Lalitpur",
  "state": "Bagmati",
  "postcode": "44600",
  "method": "esewa",
  "couponCode": "WELCOME10",
  "items": [
    {"id": "SHOPNEPAL-001", "qty": 2, "size": "M"},
    {"id": "SHOPNEPAL-008", "qty": 1, "size": "L"}
  ]
}' | tee /tmp/shopnepal_checkout_esewa.json | head -c 1000; echo
grep -q "transactionUuid" /tmp/shopnepal_checkout_esewa.json && pass "eSewa checkout created" || fail "eSewa checkout failed"
UUID=$(jq -r .transactionUuid /tmp/shopnepal_checkout_esewa.json 2>/dev/null || echo "")
[[ -n "$UUID" ]] && echo "$UUID" > /tmp/shopnepal_last_uuid.txt && info "Saved UUID: $UUID"
