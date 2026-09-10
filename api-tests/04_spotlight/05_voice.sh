#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
info "POST /api/spotlight/voice transcript=English jacket search"
curl -s -X POST "$BASE_URL/api/spotlight/voice" -H "$JSON_HDR" -d '{
  "transcript": "Show me jackets for winter"
}' | tee /tmp/spot_voice_en.json | jq . 2>/dev/null | head -n 30; echo
info "POST /api/spotlight/voice transcript=Nepali shoes"
curl -s -X POST "$BASE_URL/api/spotlight/voice" -H "$JSON_HDR" -d '{
  "transcript": "जुत्ता देखाउनुहोस्"
}' | tee /tmp/spot_voice_np.json | jq . 2>/dev/null | head -n 30; echo
info "POST /api/spotlight/voice transcript=track order"
curl -s -X POST "$BASE_URL/api/spotlight/voice" -H "$JSON_HDR" -d '{
  "transcript": "track my order please"
}' | jq . 2>/dev/null | head -n 20; echo
grep -q "intent" /tmp/spot_voice_en.json && pass "Voice intent OK" || fail "Voice failed"
