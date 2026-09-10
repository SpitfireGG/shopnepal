/**
 * Category listing.
 *
 * /category.html            - every category, as a directory
 * /category.html?c=<slug>   - one category's products, with sorting
 *
 * Entirely catalogue-driven, so new categories need no new page.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const SORTS = {
    featured: { label: 'Featured', fn: (a, b) => b.rating - a.rating },
    'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
    'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
    discount: { label: 'Biggest discount', fn: (a, b) => ShopNepal.discountPct(b) - ShopNepal.discountPct(a) },
    name: { label: 'Name', fn: (a, b) => a.title.localeCompare(b.title) },
  };

  const params = () => new URLSearchParams(location.search);

  function renderDirectory(host, categories) {
    document.title = 'All categories - ShopNepal';

    host.innerHTML = `
      <nav class="pdp-breadcrumb"><a href="/">Home</a>
        <ion-icon name="chevron-forward-outline"></ion-icon><span>Categories</span>
      </nav>

      <h1 class="title">All categories</h1>

      <div class="cat-directory">
        ${categories
          .map(
            (c) => `
          <a href="/category.html?c=${encodeURIComponent(c.slug)}" class="cat-tile">
            <img src="${c.icon}" alt="" width="34" height="34">
            <span class="cat-tile-name">${escape(c.label)}</span>
            <span class="cat-tile-count">${c.count} item${c.count === 1 ? '' : 's'}</span>
          </a>`
          )
          .join('')}
      </div>`;
  }

  function renderCategory(host, category, sortKey) {
    document.title = `${category.label} - ShopNepal`;

    const sort = SORTS[sortKey] ? sortKey : 'featured';
    const items = [...category.products].sort(SORTS[sort].fn);

    host.innerHTML = `
      <nav class="pdp-breadcrumb">
        <a href="/">Home</a>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <a href="/category.html">Categories</a>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <span>${escape(category.label)}</span>
      </nav>

      <div class="cat-head">
        <div>
          <h1 class="title">${escape(category.label)}</h1>
          <p class="cat-count">${category.count} product${category.count === 1 ? '' : 's'}</p>
        </div>

        <label class="cat-sort">
          <span class="pdp-field-label">Sort by</span>
          <select data-sort>
            ${Object.entries(SORTS)
              .map(([k, v]) => `<option value="${k}"${k === sort ? ' selected' : ''}>${v.label}</option>`)
              .join('')}
          </select>
        </label>
      </div>

      <div class="product-grid">${items.map(ShopNepal.home.gridCard).join('')}</div>`;

    const select = host.querySelector('[data-sort]');
    select.addEventListener('change', () => {
      const next = params();
      next.set('c', category.slug);
      next.set('sort', select.value);
      history.replaceState(null, '', `/category.html?${next}`);
      renderCategory(host, category, select.value);
    });
  }

  function renderMissing(host, slug, categories) {
    host.innerHTML = `
      <div class="pdp-empty">
        <ion-icon name="help-circle-outline"></ion-icon>
        <h1 class="pdp-title">No such category</h1>
        <p>Nothing matches <strong>${escape(slug)}</strong>.</p>
        <a href="/category.html" class="btn-primary">Browse ${categories.length} categories</a>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const host = document.querySelector('[data-category-view]');
    if (!host) return;

    const { categories } = await ShopNepal.loadCatalog();
    const slug = params().get('c');

    if (!slug) return renderDirectory(host, categories);

    const category = categories.find((c) => c.slug === slug);
    if (!category) return renderMissing(host, slug, categories);

    renderCategory(host, category, params().get('sort'));
  });
})();
