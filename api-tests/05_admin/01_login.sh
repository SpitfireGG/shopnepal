#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/admin/login username=admin password=shopnepal123"
curl -s -X POST "$BASE_URL/api/admin/login" -H "$JSON_HDR" -d '{
  "username": "admin",
  "password": "shopnepal123"
}' | tee /tmp/admin_login.json | jq . 2>/dev/null | head -n 20; echo
grep -q "token" /tmp/admin_login.json && pass "Admin login OK" || fail "Login failed"
TOKEN=$(jq -r .basic /tmp/admin_login.json 2>/dev/null || echo "$ADMIN_BASIC")
echo "$TOKEN" > /tmp/admin_token.txt
info "Saved token: $TOKEN"
info "POST /api/admin/login with wrong password (should 401)"
curl -s -X POST "$BASE_URL/api/admin/login" -H "$JSON_HDR" -d '{
  "username": "admin",
  "password": "wrongpass123"
}' | jq . 2>/dev/null; echo
