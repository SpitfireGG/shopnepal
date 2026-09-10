#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "GET /api/products"
RESP=$(curl "${curl_opts[@]}" "$BASE_URL/api/products")
BODY=$(echo "$RESP" | sed '$d')
CODE=$(echo "$RESP" | tail -n1)
echo "$BODY" | head -c 500
echo
[[ "$CODE" == "200" ]] && pass "List products $CODE" || fail "List products $CODE"
echo "$BODY" | grep -q "SHOPNEPAL" && pass "Products seeded" || warn "No products"

