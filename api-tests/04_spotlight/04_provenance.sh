#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
ID="SHOPNEPAL-022"
info "GET /api/spotlight/provenance/$ID"
curl -s "$BASE_URL/api/spotlight/provenance/$ID" | tee /tmp/spot_prov.json | jq . 2>/dev/null | head -n 30; echo
grep -q "ipfsCid" /tmp/spot_prov.json && pass "Provenance OK" || fail "Provenance failed"
info "GET /api/spotlight/provenance/SHOPNEPAL-001"
curl -s "$BASE_URL/api/spotlight/provenance/SHOPNEPAL-001" | jq . 2>/dev/null | head -n 20; echo
