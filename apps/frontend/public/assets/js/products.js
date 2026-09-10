/**
 * ShopNepal - product catalogue.
 *
 * Single source of truth for every product on the site. Loaded as a plain
 * script in the browser (window.ShopNepal) and required by the Express server for
 * slug routing and server-side pricing.
 *
 * Prices are whole NPR - eSewa settles in rupees only, and the server always
 * re-reads the price from here rather than trusting the browser.
 */

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShopNepal = Object.assign(root.ShopNepal || {}, api);
})(typeof self !== 'undefined' ? self : this, function () {

  const PRODUCTS = [
    {
      "id": "SHOPNEPAL-001",
      "slug": "baby-fabric-shoes",
      "title": "baby fabric shoes",
      "category": "shoes",
      "badge": null,
      "rating": 5,
      "price": 520,
      "compareAt": 650,
      "images": [
        "/assets/images/products/1.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 8,
      "description": "Soft-soled crib shoes in breathable cotton, with an elasticated ankle that stays on small feet."
    },
    {
      "id": "SHOPNEPAL-002",
      "slug": "mens-hoodies-t-shirt",
      "title": "men's hoodies t-shirt",
      "category": "hoodies",
      "badge": null,
      "rating": 4,
      "price": 910,
      "compareAt": 2210,
      "images": [
        "/assets/images/products/2.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 15,
      "description": "Mid-weight cotton hoodie with a lined hood and a kangaroo pocket. Pre-shrunk, so it keeps its length."
    },
    {
      "id": "SHOPNEPAL-003",
      "slug": "girls-t-shirt",
      "title": "girls t-shirt",
      "category": "clothes",
      "badge": null,
      "rating": 4,
      "price": 390,
      "compareAt": 650,
      "images": [
        "/assets/images/products/3.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 22,
      "description": "Combed cotton tee with a taped neck and a print that survives the wash."
    },
    {
      "id": "SHOPNEPAL-004",
      "slug": "woolen-hat-for-men",
      "title": "woolen hat for men",
      "category": "hats",
      "badge": null,
      "rating": 5,
      "price": 1560,
      "compareAt": 1950,
      "images": [
        "/assets/images/products/4.jpg"
      ],
      "sizes": null,
      "stock": 29,
      "description": "Rib-knit lambswool beanie with a turned cuff. Warm without the itch."
    },
    {
      "id": "SHOPNEPAL-005",
      "slug": "relaxed-short-full-sleeve-t-shirt",
      "title": "Relaxed Short full Sleeve T-Shirt",
      "category": "clothes",
      "badge": null,
      "rating": 4,
      "price": 1560,
      "compareAt": 5850,
      "images": [
        "/assets/images/products/clothes-1.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 11,
      "description": "A relaxed body with a slightly dropped shoulder, cut from mid-weight jersey that holds its shape."
    },
    {
      "id": "SHOPNEPAL-006",
      "slug": "girls-pnk-embro-design-top",
      "title": "Girls pnk Embro design Top",
      "category": "clothes",
      "badge": null,
      "rating": 4,
      "price": 1170,
      "compareAt": 7930,
      "images": [
        "/assets/images/products/clothes-2.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 18,
      "description": "Cotton top with hand-guided embroidery across the yoke and a covered button placket."
    },
    {
      "id": "SHOPNEPAL-007",
      "slug": "black-floral-wrap-midi-skirt",
      "title": "Black Floral Wrap Midi Skirt",
      "category": "skirt",
      "badge": "new",
      "rating": 5,
      "price": 3250,
      "compareAt": 4550,
      "images": [
        "/assets/images/products/clothes-3.jpg",
        "/assets/images/products/clothes-4.jpg"
      ],
      "sizes": [
        "XS",
        "S",
        "M",
        "L"
      ],
      "stock": 25,
      "description": "A true wrap silhouette with a hidden inner tie, cut to fall mid-calf. Viscose blend with a fluid drape."
    },
    {
      "id": "SHOPNEPAL-008",
      "slug": "pure-garment-dyed-cotton-shirt",
      "title": "Pure Garment Dyed Cotton Shirt",
      "category": "shirt",
      "badge": "sale",
      "rating": 4,
      "price": 5850,
      "compareAt": 7280,
      "images": [
        "/assets/images/products/shirt-1.jpg",
        "/assets/images/products/shirt-2.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 32,
      "description": "Garment-dyed after stitching, so the colour settles into the weave and softens with every wash. Regular fit, coconut buttons."
    },
    {
      "id": "SHOPNEPAL-009",
      "slug": "men-yarn-fleece-full-zip-jacket",
      "title": "MEN Yarn Fleece Full-Zip Jacket",
      "category": "jacket",
      "badge": null,
      "rating": 4,
      "price": 7540,
      "compareAt": 8450,
      "images": [
        "/assets/images/products/jacket-5.jpg",
        "/assets/images/products/jacket-6.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 14,
      "description": "Brushed yarn fleece with a full-length YKK zip. Light enough to layer, warm enough for an early-morning commute."
    },
    {
      "id": "SHOPNEPAL-010",
      "slug": "mens-quilted-puffer-jacket",
      "title": "Mens Quilted Puffer Jacket",
      "category": "jacket",
      "badge": null,
      "rating": 4,
      "price": 4160,
      "compareAt": 5850,
      "images": [
        "/assets/images/products/jacket-1.jpg",
        "/assets/images/products/jacket-2.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 21,
      "description": "Baffled down-fill puffer with a stowaway hood and a water-repellent shell."
    },
    {
      "id": "SHOPNEPAL-011",
      "slug": "mens-winter-leathers-jackets",
      "title": "Mens Winter Leathers Jackets",
      "category": "jacket",
      "badge": "15%",
      "rating": 4,
      "price": 6240,
      "compareAt": 9750,
      "images": [
        "/assets/images/products/jacket-3.jpg",
        "/assets/images/products/jacket-4.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 28,
      "description": "Full-grain leather shell with a quilted inner lining, built for Kathmandu winters. Ribbed storm cuffs and four outer pockets."
    },
    {
      "id": "SHOPNEPAL-012",
      "slug": "better-basics-french-terry-sweatshorts",
      "title": "Better Basics French Terry Sweatshorts",
      "category": "shorts",
      "badge": "sale",
      "rating": 4,
      "price": 10140,
      "compareAt": 11050,
      "images": [
        "/assets/images/products/shorts-1.jpg",
        "/assets/images/products/shorts-2.jpg"
      ],
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "stock": 10,
      "description": "Loopback French terry with a drawcord waist and deep side pockets. The pair you reach for on rest days."
    },
    {
      "id": "SHOPNEPAL-013",
      "slug": "running-and-trekking-shoes-white",
      "title": "Running & Trekking Shoes - White",
      "category": "sports",
      "badge": null,
      "rating": 4,
      "price": 1950,
      "compareAt": 6370,
      "images": [
        "/assets/images/products/sports-1.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 17,
      "description": "A daily trainer with a breathable mesh upper and a foam midsole that stays springy past its first month."
    },
    {
      "id": "SHOPNEPAL-014",
      "slug": "trekking-and-running-shoes-black",
      "title": "Trekking & Running Shoes - black",
      "category": "sports",
      "badge": "sale",
      "rating": 4,
      "price": 7540,
      "compareAt": 8320,
      "images": [
        "/assets/images/products/sports-2.jpg",
        "/assets/images/products/sports-4.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 24,
      "description": "Aggressive lugged outsole with a rock plate underfoot, tuned for loose trail and wet stone."
    },
    {
      "id": "SHOPNEPAL-015",
      "slug": "womens-party-wear-shoes",
      "title": "Womens Party Wear Shoes",
      "category": "party wear",
      "badge": "sale",
      "rating": 4,
      "price": 3250,
      "compareAt": 3900,
      "images": [
        "/assets/images/products/party-wear-1.jpg",
        "/assets/images/products/party-wear-2.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 31,
      "description": "Satin-finish party heel with a padded footbed, so it survives the whole evening."
    },
    {
      "id": "SHOPNEPAL-016",
      "slug": "sports-claw-womens-shoes",
      "title": "Sports Claw Women's Shoes",
      "category": "sports",
      "badge": null,
      "rating": 4,
      "price": 7020,
      "compareAt": 8450,
      "images": [
        "/assets/images/products/sports-3.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 13,
      "description": "Low-profile trainer with a wide toe box and a grippy claw-pattern outsole."
    },
    {
      "id": "SHOPNEPAL-017",
      "slug": "air-trekking-shoes-white",
      "title": "Air Trekking Shoes - white",
      "category": "sports",
      "badge": null,
      "rating": 4,
      "price": 6760,
      "compareAt": 7150,
      "images": [
        "/assets/images/products/sports-6.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 20,
      "description": "Cushioned air unit under the heel and a gusseted tongue that keeps trail grit out."
    },
    {
      "id": "SHOPNEPAL-018",
      "slug": "boot-with-suede-detail",
      "title": "Boot With Suede Detail",
      "category": "boots",
      "badge": null,
      "rating": 4,
      "price": 2600,
      "compareAt": 3900,
      "images": [
        "/assets/images/products/shoe-3.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 27,
      "description": "Ankle boot with suede panelling and a stacked heel, on a sole that handles a wet pavement."
    },
    {
      "id": "SHOPNEPAL-019",
      "slug": "mens-leather-formal-wear-shoes",
      "title": "Men's Leather Formal Wear shoes",
      "category": "formal",
      "badge": null,
      "rating": 4,
      "price": 6500,
      "compareAt": 8450,
      "images": [
        "/assets/images/products/shoe-1.jpg",
        "/assets/images/products/shoe-1_1.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 9,
      "description": "Goodyear-welted oxford in polished calf leather. Resoleable, so it outlasts the occasion it was bought for."
    },
    {
      "id": "SHOPNEPAL-020",
      "slug": "casual-mens-brown-shoes",
      "title": "Casual Men's Brown shoes",
      "category": "casual",
      "badge": null,
      "rating": 5,
      "price": 12870,
      "compareAt": 13650,
      "images": [
        "/assets/images/products/shoe-2.jpg",
        "/assets/images/products/shoe-2_1.jpg"
      ],
      "sizes": [
        "39",
        "40",
        "41",
        "42",
        "43",
        "44"
      ],
      "stock": 16,
      "description": "Hand-finished brown leather on a stitched rubber sole. Breaks in fast and holds a polish."
    },
    {
      "id": "SHOPNEPAL-021",
      "slug": "pocket-watch-leather-pouch",
      "title": "Pocket Watch Leather Pouch",
      "category": "watches",
      "badge": "sale",
      "rating": 4,
      "price": 19500,
      "compareAt": 22100,
      "images": [
        "/assets/images/products/watch-3.jpg",
        "/assets/images/products/watch-4.jpg"
      ],
      "sizes": null,
      "stock": 23,
      "description": "Vegetable-tanned leather pouch with a brass press stud, sized for a classic pocket watch and a spare key."
    },
    {
      "id": "SHOPNEPAL-022",
      "slug": "silver-deer-heart-necklace",
      "title": "Silver Deer Heart Necklace",
      "category": "jewellery",
      "badge": null,
      "rating": 4,
      "price": 3900,
      "compareAt": 10920,
      "images": [
        "/assets/images/products/jewellery-3.jpg"
      ],
      "sizes": null,
      "stock": 30,
      "description": "925 sterling silver on an 18-inch chain, with a lobster clasp and a small deer-heart pendant."
    },
    {
      "id": "SHOPNEPAL-023",
      "slug": "titan-100-ml-womens-perfume",
      "title": "Titan 100 Ml Womens Perfume",
      "category": "perfume",
      "badge": null,
      "rating": 4,
      "price": 1300,
      "compareAt": 5460,
      "images": [
        "/assets/images/products/perfume.jpg"
      ],
      "sizes": null,
      "stock": 12,
      "description": "An eau de parfum that opens citrus and dries down warm. 100ml, and it lasts the working day."
    },
    {
      "id": "SHOPNEPAL-024",
      "slug": "mens-leather-reversible-belt",
      "title": "Men's Leather Reversible Belt",
      "category": "belt",
      "badge": null,
      "rating": 4,
      "price": 1300,
      "compareAt": 3120,
      "images": [
        "/assets/images/products/belt.jpg"
      ],
      "sizes": null,
      "stock": 19,
      "description": "Full-grain leather, black one way and tan the other, with a rotating pin buckle."
    },
    {
      "id": "SHOPNEPAL-025",
      "slug": "platinum-zircon-classic-ring",
      "title": "platinum Zircon Classic Ring",
      "category": "jewellery",
      "badge": null,
      "rating": 4,
      "price": 8060,
      "compareAt": 8450,
      "images": [
        "/assets/images/products/jewellery-2.jpg"
      ],
      "sizes": null,
      "stock": 26,
      "description": "Platinum-plated band with a brilliant-cut zircon in a four-prong setting."
    },
    {
      "id": "SHOPNEPAL-026",
      "slug": "smart-watche-vital-plus",
      "title": "Smart watche Vital Plus",
      "category": "watches",
      "badge": null,
      "rating": 4,
      "price": 13000,
      "compareAt": 15600,
      "images": [
        "/assets/images/products/watch-1.jpg",
        "/assets/images/products/watch-2.jpg"
      ],
      "sizes": null,
      "stock": 8,
      "description": "Continuous heart-rate and SpO2 tracking, seven-day battery, and a 1.4\" AMOLED face that stays readable in sunlight."
    },
    {
      "id": "SHOPNEPAL-027",
      "slug": "shampoo-conditioner-packs",
      "title": "shampoo conditioner packs",
      "category": "cosmetics",
      "badge": null,
      "rating": 4,
      "price": 2600,
      "compareAt": 3900,
      "images": [
        "/assets/images/products/shampoo.jpg"
      ],
      "sizes": null,
      "stock": 15,
      "description": "A sulphate-free shampoo and conditioner pair for hard water, in a refill-friendly pack."
    },
    {
      "id": "SHOPNEPAL-028",
      "slug": "rose-gold-peacock-earrings",
      "title": "Rose Gold Peacock Earrings",
      "category": "jewellery",
      "badge": null,
      "rating": 4,
      "price": 2600,
      "compareAt": 3900,
      "images": [
        "/assets/images/products/jewellery-1.jpg"
      ],
      "sizes": null,
      "stock": 22,
      "description": "Rose gold-plated drops with a peacock motif, light enough to wear all day."
    }
  ];

  const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug) || null;
  const byId = (id) => PRODUCTS.find((p) => p.id === id) || null;

  /** "Rs. 6,240" - grouped the way prices are written in Nepal. */
  const formatNPR = (n) => 'Rs. ' + Number(n).toLocaleString('en-IN');

  /** Same-category products first, padded out to `limit` with the rest. */
  const related = (slug, limit = 4) => {
    const p = bySlug(slug);
    if (!p) return [];
    const same = PRODUCTS.filter((x) => x.slug !== slug && x.category === p.category);
    const rest = PRODUCTS.filter((x) => x.slug !== slug && x.category !== p.category);
    return same.concat(rest).slice(0, limit);
  };

  return { PRODUCTS, bySlug, byId, formatNPR, related };
});
