#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
TOKEN=$(cat /tmp/admin_token.txt 2>/dev/null || echo "$ADMIN_BASIC")
info "GET /api/admin/products"
curl -s "$BASE_URL/api/admin/products" -H "Authorization: Basic $TOKEN" | tee /tmp/admin_products.json | jq 'length' 2>/dev/null; echo
info "POST /api/admin/products create Handwoven Pashmina Shawl"
curl -s -X POST "$BASE_URL/api/admin/products" -H "$JSON_HDR" -H "Authorization: Basic $TOKEN" -d '{
  "title": "Handwoven Pashmina Shawl Red",
  "category": "clothes",
  "badge": "new",
  "rating": 5,
  "price": 8500,
  "compareAt": 12000,
  "images": ["/assets/images/products/clothes-1.jpg", "/assets/images/products/clothes-2.jpg"],
  "sizes": ["S", "M", "L", "XL"],
  "stock": 45,
  "description": "Authentic handwoven pashmina shawl from Bhaktapur, natural dyes, 70x200cm, dry clean only.",
  "reorderLevel": 5
}' | tee /tmp/admin_create.json | jq . 2>/dev/null | head -n 30; echo
NEW_ID=$(jq -r .id /tmp/admin_create.json 2>/dev/null || echo "")
[[ -z "$NEW_ID" || "$NEW_ID" == "null" ]] && NEW_ID="SHOPNEPAL-TEST-$(date +%s)"
echo "$NEW_ID" > /tmp/new_product_id.txt
info "Created product ID: $NEW_ID"
info "PUT /api/admin/products/$NEW_ID update price and stock"
curl -s -X PUT "$BASE_URL/api/admin/products/$NEW_ID" -H "$JSON_HDR" -H "Authorization: Basic $TOKEN" -d '{
  "title": "Handwoven Pashmina Shawl Red Premium",
  "category": "clothes",
  "badge": "sale",
  "rating": 5,
  "price": 7999,
  "compareAt": 12000,
  "images": ["/assets/images/products/clothes-1.jpg"],
  "sizes": ["S", "M", "L"],
  "stock": 38,
  "description": "Updated description: Premium handwoven pashmina with festival discount, limited stock.",
  "reorderLevel": 3
}' | jq . 2>/dev/null | head -n 30; echo
info "DELETE /api/admin/products/$NEW_ID"
curl -s -X DELETE "$BASE_URL/api/admin/products/$NEW_ID" -H "Authorization: Basic $TOKEN" | head -c 200; echo
pass "Products CRUD completed"
