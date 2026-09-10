#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/checkout method=khalti"
curl -s -X POST "$BASE_URL/api/checkout" -H "$JSON_HDR" -d '{
  "name": "Sita Sharma",
  "phone": "9812345678",
  "email": "sita.khalti@shopnepal.test",
  "address": "Thamel, Kathmandu, Ward 16, Chhetrapati",
  "city": "Kathmandu",
  "state": "Bagmati",
  "postcode": "44601",
  "method": "khalti",
  "couponCode": "FLAT500",
  "items": [
    {"id": "SHOPNEPAL-010", "qty": 1, "size": "L"},
    {"id": "SHOPNEPAL-015", "qty": 2, "size": "42"}
  ]
}' | tee /tmp/shopnepal_checkout_khalti.json | head -c 1000; echo
grep -q "transactionUuid" /tmp/shopnepal_checkout_khalti.json && pass "Khalti checkout created" || warn "Khalti may fail without keys"
