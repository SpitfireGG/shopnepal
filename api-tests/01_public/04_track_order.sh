#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
UUID="${1:-SHOPNEPAL-20250910-abc123}"
info "GET /api/track/$UUID (expect 200 or null order)"
RESP=$(curl "${curl_opts[@]}" "$BASE_URL/api/track/$UUID")
BODY=$(echo "$RESP" | sed '$d'); CODE=$(echo "$RESP" | tail -n1)
echo "$BODY" | head -c 600; echo
[[ "$CODE" == "200" ]] && pass "Track $CODE" || warn "Track $CODE"
info "GET /api/orders/$UUID"
RESP2=$(curl "${curl_opts[@]}" "$BASE_URL/api/orders/$UUID")
echo "$RESP2" | sed '$d' | head -c 600; echo
