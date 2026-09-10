#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
SLUG="mens-hoodies-t-shirt"
info "GET /api/products/$SLUG"
RESP=$(curl "${curl_opts[@]}" "$BASE_URL/api/products/$SLUG")
BODY=$(echo "$RESP" | sed '$d'); CODE=$(echo "$RESP" | tail -n1)
echo "$BODY" | head -c 600; echo
[[ "$CODE" == "200" ]] && pass "Get by slug $CODE" || fail "Get by slug $CODE"
