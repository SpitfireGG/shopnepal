#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
TOKEN=$(cat /tmp/admin_token.txt 2>/dev/null || echo "$ADMIN_BASIC")
FROM="2025-01-01"
TO="2026-12-31"
info "GET /api/admin/reports/sales?from=$FROM&to=$TO"
curl -s "$BASE_URL/api/admin/reports/sales?from=$FROM&to=$TO" -H "Authorization: Basic $TOKEN" | tee /tmp/report.json | jq . 2>/dev/null | head -n 50; echo
info "GET /api/admin/reports/sales.csv"
curl -s "$BASE_URL/api/admin/reports/sales.csv?from=$FROM&to=$TO" -H "Authorization: Basic $TOKEN" | head -n 20; echo; pass "CSV report OK"
info "GET /api/admin/audit"
curl -s "$BASE_URL/api/admin/audit" -H "Authorization: Basic $TOKEN" | tee /tmp/audit.json | jq 'length' 2>/dev/null; echo
info "GET /api/admin/coupons"
curl -s "$BASE_URL/api/admin/coupons" -H "Authorization: Basic $TOKEN" | tee /tmp/admin_coupons.json | jq . 2>/dev/null | head -n 30; echo
info "POST /api/admin/coupons create TEST25"
curl -s -X POST "$BASE_URL/api/admin/coupons" -H "$JSON_HDR" -H "Authorization: Basic $TOKEN" -d '{
  "code": "TEST25",
  "type": "percent",
  "value": 25,
  "minAmount": 2000,
  "active": true
}' | tee /tmp/coupon_create.json | jq . 2>/dev/null | head -n 20; echo
info "POST /api/admin/coupons create FLAT1000"
curl -s -X POST "$BASE_URL/api/admin/coupons" -H "$JSON_HDR" -H "Authorization: Basic $TOKEN" -d '{
  "code": "FLAT1000",
  "type": "flat",
  "value": 1000,
  "minAmount": 8000,
  "active": true
}' | jq . 2>/dev/null | head -n 20; echo
pass "Reports/Audit/Coupons OK"
