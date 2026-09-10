#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
TOKEN=$(cat /tmp/admin_token.txt 2>/dev/null || echo "$ADMIN_BASIC")
info "GET /api/admin/orders"
curl -s "$BASE_URL/api/admin/orders" -H "Authorization: Basic $TOKEN" | tee /tmp/admin_orders.json | jq 'length' 2>/dev/null; echo
UUID=$(jq -r '.[0].transactionUuid' /tmp/admin_orders.json 2>/dev/null || echo "")
[[ -z "$UUID" || "$UUID" == "null" ]] && UUID=$(cat /tmp/shopnepal_last_uuid.txt 2>/dev/null || echo "SHOPNEPAL-TEST-001")
info "Target UUID: $UUID"
info "GET /api/admin/orders/$UUID"
curl -s "$BASE_URL/api/admin/orders/$UUID" -H "Authorization: Basic $TOKEN" | jq . 2>/dev/null | head -n 40; echo
info "PATCH /api/admin/orders/$UUID status=PROCESSING"
curl -s -X PATCH "$BASE_URL/api/admin/orders/$UUID" -H "$JSON_HDR" -H "Authorization: Basic $TOKEN" -H "X-Admin-User: admin" -d '{
  "status": "PROCESSING"
}' | jq . 2>/dev/null | head -n 20; echo
info "PATCH back to COMPLETED"
curl -s -X PATCH "$BASE_URL/api/admin/orders/$UUID" -H "$JSON_HDR" -H "Authorization: Basic $TOKEN" -H "X-Admin-User: admin" -d '{
  "status": "COMPLETED"
}' | jq . 2>/dev/null | head -n 20; echo
pass "Orders admin OK"
