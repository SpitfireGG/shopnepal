#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "GET /api/search?q=jacket&category=jacket"
RESP=$(curl "${curl_opts[@]}" "$BASE_URL/api/search?q=jacket&category=jacket")
BODY=$(echo "$RESP" | sed '$d'); CODE=$(echo "$RESP" | tail -n1)
echo "$BODY" | head -c 600; echo
[[ "$CODE" == "200" ]] && pass "Search $CODE" || fail "Search $CODE"
info "GET /api/products?q=shoes"
RESP2=$(curl "${curl_opts[@]}" "$BASE_URL/api/products?q=shoes")
echo "$RESP2" | sed '$d' | head -c 400; echo
