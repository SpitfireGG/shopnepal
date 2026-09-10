#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/spotlight/bnpl/calc amount=15000 months=3 (0% EMI)"
curl -s -X POST "$BASE_URL/api/spotlight/bnpl/calc" -H "$JSON_HDR" -d '{
  "amount": 15000,
  "months": 3
}' | tee /tmp/bnpl3.json | jq . 2>/dev/null | head -n 20; echo
info "POST /api/spotlight/bnpl/calc amount=25000 months=6 (2%)"
curl -s -X POST "$BASE_URL/api/spotlight/bnpl/calc" -H "$JSON_HDR" -d '{
  "amount": 25000,
  "months": 6
}' | tee /tmp/bnpl6.json | jq . 2>/dev/null | head -n 20; echo
info "POST /api/spotlight/bnpl/calc amount=60000 months=12 (5%)"
curl -s -X POST "$BASE_URL/api/spotlight/bnpl/calc" -H "$JSON_HDR" -d '{
  "amount": 60000,
  "months": 12
}' | jq . 2>/dev/null | head -n 20; echo
grep -q "monthly" /tmp/bnpl3.json && pass "BNPL calc OK" || fail "BNPL failed"
