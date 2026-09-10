#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/checkout method=dummy (offline test gateway)"
curl -s -X POST "$BASE_URL/api/checkout" -H "$JSON_HDR" -d '{
  "name": "Ram Bahadur Thapa",
  "phone": "9823456789",
  "email": "ram.dummy@shopnepal.test",
  "address": "Pokhara, Lakeside, Street 12, Kaski",
  "city": "Pokhara",
  "state": "Gandaki",
  "postcode": "33700",
  "method": "dummy",
  "items": [
    {"id": "SHOPNEPAL-003", "qty": 3, "size": "M"},
    {"id": "SHOPNEPAL-022", "qty": 1, "size": "OneSize"}
  ]
}' | tee /tmp/shopnepal_checkout_dummy.json | head -c 1000; echo
grep -q "redirectUrl" /tmp/shopnepal_checkout_dummy.json && pass "Dummy checkout created" || fail "Dummy checkout failed"
UUID=$(jq -r .transactionUuid /tmp/shopnepal_checkout_dummy.json 2>/dev/null || echo "")
[[ -n "$UUID" ]] && echo "$UUID" > /tmp/shopnepal_last_uuid.txt && info "Saved UUID: $UUID"
