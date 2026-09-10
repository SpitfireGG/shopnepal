#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/config.sh"
BASE_URL="${BASE_URL:-http://localhost:4000}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${CYAN} ShopNepal API Test Suite — $BASE_URL ${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
TOTAL=0; PASS=0; FAIL=0
run() {
  local script="$1"
  TOTAL=$((TOTAL+1))
  echo
  echo -e "${YELLOW}━━━ [$TOTAL] $(basename "$script") ━━━${NC}"
  if bash "$script"; then
    PASS=$((PASS+1)); echo -e "${GREEN}   ✔ PASS${NC}"
  else
    FAIL=$((FAIL+1)); echo -e "${RED}   ✘ FAIL${NC}"
  fi
  sleep 0.3
}
check_server() {
  info "Checking $BASE_URL/api/products ..."
  if curl -s --connect-timeout 3 "$BASE_URL/api/products" > /dev/null; then pass "Server reachable"; else fail "Server not reachable at $BASE_URL — start backend first (npm run dev)"; exit 1; fi
}
check_server
run "$SCRIPT_DIR/01_public/01_list_products.sh"
run "$SCRIPT_DIR/01_public/02_get_product_by_slug.sh"
run "$SCRIPT_DIR/01_public/03_search.sh"
run "$SCRIPT_DIR/03_coupons/01_validate_welcome10.sh"
run "$SCRIPT_DIR/03_coupons/02_validate_flat500.sh"
run "$SCRIPT_DIR/03_coupons/03_validate_below_min.sh"
run "$SCRIPT_DIR/02_checkout/01_checkout_esewa.sh"
run "$SCRIPT_DIR/02_checkout/02_checkout_khalti.sh"
run "$SCRIPT_DIR/02_checkout/03_checkout_dummy.sh"
run "$SCRIPT_DIR/02_checkout/04_checkout_with_coupon_and_sizes.sh"
run "$SCRIPT_DIR/01_public/04_track_order.sh"
run "$SCRIPT_DIR/04_spotlight/01_visual_search.sh"
run "$SCRIPT_DIR/04_spotlight/02_visual_search_with_hint.sh"
run "$SCRIPT_DIR/04_spotlight/03_stylist.sh"
run "$SCRIPT_DIR/04_spotlight/04_provenance.sh"
run "$SCRIPT_DIR/04_spotlight/05_voice.sh"
run "$SCRIPT_DIR/04_spotlight/06_courier.sh"
run "$SCRIPT_DIR/04_spotlight/07_bnpl.sh"
run "$SCRIPT_DIR/05_admin/01_login.sh"
run "$SCRIPT_DIR/05_admin/02_stats.sh"
run "$SCRIPT_DIR/05_admin/03_products_crud.sh"
run "$SCRIPT_DIR/05_admin/04_orders.sh"
run "$SCRIPT_DIR/05_admin/05_reports_audit_coupons.sh"
echo
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${GREEN} Passed: $PASS/$TOTAL ${NC}"
[[ $FAIL -gt 0 ]] && echo -e "${RED} Failed: $FAIL/$TOTAL ${NC}" || echo -e "${GREEN} All tests passed! ${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo "Artifacts: /tmp/shopnepal_*.json /tmp/admin_*.json /tmp/spot_*.json"
