#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
TOKEN=$(cat /tmp/admin_token.txt 2>/dev/null || echo "$ADMIN_BASIC")
info "GET /api/admin/stats with Basic auth"
curl -s "$BASE_URL/api/admin/stats" -H "Authorization: Basic $TOKEN" | tee /tmp/admin_stats.json | jq . 2>/dev/null | head -n 40; echo
grep -q "totalOrders" /tmp/admin_stats.json && pass "Stats OK" || fail "Stats failed"
