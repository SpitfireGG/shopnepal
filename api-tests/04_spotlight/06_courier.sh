#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
UUID=$(cat /tmp/shopnepal_last_uuid.txt 2>/dev/null || echo "SHOPNEPAL-20250910-TEST123")
ORDER_ID="$UUID"
info "GET /api/spotlight/courier/$ORDER_ID"
curl -s "$BASE_URL/api/spotlight/courier/$ORDER_ID" | tee /tmp/spot_courier.json | jq . 2>/dev/null | head -n 30; echo
grep -q "lat" /tmp/spot_courier.json && pass "Courier location OK" || fail "Courier failed"
info "GET /api/spotlight/courier/SHOPNEPAL-20250910-DEMO999"
curl -s "$BASE_URL/api/spotlight/courier/SHOPNEPAL-20250910-DEMO999" | jq . 2>/dev/null | head -n 20; echo
