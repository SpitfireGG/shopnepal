/**
 * Catalogue source for every dynamic section on the site.
 *
 * Products come from /api/products when the server is up, and fall back to the
 * catalogue bundled in products.js when it is not - so the pages still render
 * from a file:// open, and they keep working while the backend is being
 * rebuilt underneath them.
 *
 * Categories are DERIVED from the products rather than stored separately.
 * That is the whole point of making the navigation dynamic: add a product in
 * the admin with a new category and the menus, dropdowns, sidebar and footer
 * all pick it up with no markup to edit.
 */

'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShopNepal = Object.assign(root.ShopNepal || {}, api);
})(typeof self !== 'undefined' ? self : this, function () {

  /** Icons shipped with the template, matched to category names. */
  const CATEGORY_ICONS = {
    shoes: 'shoes', boots: 'shoes', sports: 'shoes', formal: 'shoes', casual: 'shoes',
    hats: 'hat', jewellery: 'jewelry', jewelry: 'jewelry',
    jacket: 'jacket', jackets: 'jacket', 'winter wear': 'coat', hoodies: 'coat',
    shorts: 'shorts', perfume: 'perfume', watches: 'watch', watch: 'watch',
    cosmetics: 'cosmetics', clothes: 'tee', shirt: 'tee', 'mens fashion': 'tee',
    skirt: 'dress', 'party wear': 'dress', dress: 'dress', belt: 'bag', bag: 'bag',
    glasses: 'glasses',
  };

  const slugifyCategory = (name) =>
    String(name).toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const titleCase = (s) =>
    String(s).replace(/\b[a-z]/g, (c) => c.toUpperCase());

  let cache = null;

  /** Products from the API, falling back to the bundled catalogue. */
  async function loadProducts({ force = false } = {}) {
    if (cache && !force) return cache;

    const bundled = (typeof window !== 'undefined' && window.ShopNepal && window.ShopNepal.PRODUCTS) || [];

    try {
      const res = await fetch('/api/products', { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products;
        // An empty API response is treated as "not useful yet" rather than as
        // an empty shop, so a half-migrated backend cannot blank the site.
        if (Array.isArray(list) && list.length) {
          cache = list;
          return cache;
        }
      }
    } catch {
      /* offline, or the server is mid-restart - fall through */
    }

    cache = bundled;
    return cache;
  }

  /**
   * Categories derived from the product list, biggest first.
   * Each carries its products, so a menu can show counts and previews without
   * a second pass over the data.
   */
  function categoriesFrom(products) {
    const map = new Map();

    products.forEach((product) => {
      const name = String(product.category || 'general').toLowerCase().trim();
      if (!map.has(name)) {
        map.set(name, {
          name,
          label: titleCase(name),
          slug: slugifyCategory(name),
          icon: `/assets/images/icons/${CATEGORY_ICONS[name] || 'tee'}.svg`,
          products: [],
        });
      }
      map.get(name).products.push(product);
    });

    return [...map.values()]
      .map((c) => ({ ...c, count: c.products.length, image: c.products[0] && c.products[0].images[0] }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }

  /** Everything the dynamic sections need, resolved once. */
  async function loadCatalog(options) {
    const products = await loadProducts(options);
    return { products, categories: categoriesFrom(products) };
  }

  const discountPct = (p) =>
    p.compareAt && p.compareAt > p.price
      ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
      : 0;

  /** Named product selections the homepage sections are built from. */
  const selections = {
    newArrivals: (products, n = 8) => [...products].slice(-n).reverse(),
    trending: (products, n = 8) => [...products].sort((a, b) => b.rating - a.rating || b.price - a.price).slice(0, n),
    topRated: (products, n = 8) => [...products].sort((a, b) => b.rating - a.rating).slice(0, n),
    bestSellers: (products, n = 4) => [...products].sort((a, b) => a.stock - b.stock).slice(0, n),
    onSale: (products, n = 12) => [...products].filter(discountPct).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, n),
    /** The single best discount drives the "deal of the day" panel. */
    deal: (products) => [...products].sort((a, b) => discountPct(b) - discountPct(a))[0] || null,
  };

  return { loadCatalog, loadProducts, categoriesFrom, selections, discountPct, slugifyCategory, titleCase, CATEGORY_ICONS };
});
