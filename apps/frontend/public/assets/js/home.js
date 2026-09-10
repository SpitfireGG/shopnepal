/**
 * Dynamic homepage sections.
 *
 * The category strip, the four sidebar showcases, the deal of the day and the
 * main product grid are all generated from the catalogue instead of being
 * hardcoded in index.html. Markup mirrors the original template's classes so
 * the existing stylesheet applies unchanged.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const categoryUrl = (c) => `/category.html?c=${encodeURIComponent(c.slug)}`;

  const stars = (rating) =>
    Array.from({ length: 5 }, (_, i) => `<ion-icon name="${i < rating ? 'star' : 'star-outline'}"></ion-icon>`).join('');

  const priceBox = (p) => `
    <div class="price-box">
      <p class="price">${ShopNepal.formatNPR(p.price)}</p>
      ${p.compareAt ? `<del>${ShopNepal.formatNPR(p.compareAt)}</del>` : ''}
    </div>`;

  /** The compact card used by the sidebar showcases. */
  const showcaseCard = (p) => `
    <div class="showcase">
      <a href="/product/${escape(p.slug)}" class="showcase-img-box">
        <img src="${escape(p.images[0])}" alt="${escape(p.title)}" class="showcase-img" width="75">
      </a>
      <div class="showcase-content">
        <a href="/product/${escape(p.slug)}">
          <h4 class="showcase-title">${escape(p.title)}</h4>
        </a>
        <div class="showcase-rating">${stars(p.rating)}</div>
        ${priceBox(p)}
      </div>
    </div>`;

  /** The full card used by the main product grid. */
  const gridCard = (p) => {
    const hover = p.images[1] || p.images[0];
    const off = ShopNepal.discountPct(p);

    return `
      <div class="showcase">

        <div class="showcase-banner">
          <img src="${escape(p.images[0])}" alt="${escape(p.title)}" width="300" class="product-img default">
          <img src="${escape(hover)}" alt="${escape(p.title)}" width="300" class="product-img hover">

          ${off ? `<p class="showcase-badge">${off}%</p>` : ''}
          ${p.stock === 0 ? '<p class="showcase-badge angle black">sold out</p>' : ''}

          <div class="showcase-actions">
            <button class="btn-action" data-wishlist="${escape(p.id)}" aria-label="Save ${escape(p.title)}">
              <ion-icon name="heart-outline"></ion-icon>
            </button>
            <a href="/product/${escape(p.slug)}" class="btn-action" aria-label="View ${escape(p.title)}">
              <ion-icon name="eye-outline"></ion-icon>
            </a>
            <a href="${categoryUrl({ slug: ShopNepal.slugifyCategory(p.category) })}" class="btn-action" aria-label="More in ${escape(p.category)}">
              <ion-icon name="repeat-outline"></ion-icon>
            </a>
            <button class="btn-action" data-add-to-cart="${escape(p.id)}" aria-label="Add ${escape(p.title)} to bag">
              <ion-icon name="bag-add-outline"></ion-icon>
            </button>
          </div>
        </div>

        <div class="showcase-content">
          <a href="${categoryUrl({ slug: ShopNepal.slugifyCategory(p.category) })}" class="showcase-category">${escape(p.category)}</a>
          <a href="/product/${escape(p.slug)}">
            <h3 class="showcase-title">${escape(p.title)}</h3>
          </a>
          <div class="showcase-rating">${stars(p.rating)}</div>
          ${priceBox(p)}
        </div>

      </div>`;
  };

  /** Showcases are laid out in columns of four in the original template. */
  function showcaseGroups(products, perGroup = 4) {
    const groups = [];
    for (let i = 0; i < products.length; i += perGroup) groups.push(products.slice(i, i + perGroup));
    return groups
      .map((group) => `<div class="showcase-container">${group.map(showcaseCard).join('')}</div>`)
      .join('');
  }

  function renderShowcase(host, heading, products, headingTag) {
    if (!host) return;
    const tag = headingTag || 'h2';
    const cls = tag === 'h3' ? 'showcase-heading' : 'title';

    host.innerHTML = `
      <${tag} class="${cls}">${escape(heading)}</${tag}>
      <div class="showcase-wrapper has-scrollbar">
        ${showcaseGroups(products)}
      </div>`;
  }

  function renderCategoryStrip(host, categories) {
    if (!host) return;

    host.innerHTML = `
      <div class="container">
        <div class="category-item-container has-scrollbar">
          ${categories
            .map(
              (c) => `
            <div class="category-item">
              <div class="category-img-box">
                <img src="${c.icon}" alt="${escape(c.label)}" width="30">
              </div>
              <div class="category-content-box">
                <div class="category-content-flex">
                  <h3 class="category-item-title">${escape(c.label)}</h3>
                  <p class="category-item-amount">(${c.count})</p>
                </div>
                <a href="${categoryUrl(c)}" class="category-btn">Show all</a>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>`;
  }

  function renderDeal(host, product) {
    if (!host || !product) return;

    const off = ShopNepal.discountPct(product);
    const sold = Math.max(1, product.stock ? Math.round(product.stock * 0.6) : 15);
    const available = product.stock || 40;

    host.innerHTML = `
      <h2 class="title">Deal of the day</h2>

      <div class="showcase-wrapper has-scrollbar">
        <div class="showcase-container">

          <div class="showcase">

            <div class="showcase-banner">
              <img src="${escape(product.images[0])}" alt="${escape(product.title)}" class="showcase-img">
            </div>

            <div class="showcase-content">

              <div class="showcase-rating">${stars(product.rating)}</div>

              <h3 class="showcase-title">
                <a href="/product/${escape(product.slug)}" class="showcase-title">${escape(product.title)}</a>
              </h3>

              <p class="showcase-desc">${escape(product.description)}</p>

              <div class="price-box">
                <p class="price">${ShopNepal.formatNPR(product.price)}</p>
                ${product.compareAt ? `<del>${ShopNepal.formatNPR(product.compareAt)}</del>` : ''}
                ${off ? `<span class="pdp-save">${off}% off</span>` : ''}
              </div>

              <button class="add-cart-btn" data-add-to-cart="${escape(product.id)}">add to cart</button>

              <div class="showcase-status">
                <div class="wrapper">
                  <p>already sold: <b>${sold}</b></p>
                  <p>available: <b>${available}</b></p>
                </div>
                <div class="showcase-status-bar" style="--width: ${Math.min(100, Math.round((sold / (sold + available)) * 100))}%"></div>
              </div>

            </div>

          </div>

        </div>
      </div>`;
  }

  function renderGrid(host, heading, products) {
    if (!host) return;
    host.innerHTML = `
      <h2 class="title">${escape(heading)}</h2>
      <div class="product-grid">${products.map(gridCard).join('')}</div>`;
  }

  async function mount() {
    const anyTarget = document.querySelector('[data-home-grid], [data-home-categories], [data-showcase]');
    if (!anyTarget) return;

    let products, categories;
    try {
      ({ products, categories } = await ShopNepal.loadCatalog());
    } catch {
      return;
    }
    if (!products.length) return;

    const s = ShopNepal.selections;

    renderCategoryStrip(document.querySelector('[data-home-categories]'), categories);

    renderShowcase(document.querySelector('[data-showcase="best-sellers"]'), 'Best sellers', s.bestSellers(products), 'h3');
    renderShowcase(document.querySelector('[data-showcase="new-arrivals"]'), 'New arrivals', s.newArrivals(products));
    renderShowcase(document.querySelector('[data-showcase="trending"]'), 'Trending', s.trending(products));
    renderShowcase(document.querySelector('[data-showcase="top-rated"]'), 'Top rated', s.topRated(products));

    renderDeal(document.querySelector('[data-home-deal]'), s.deal(products));
    renderGrid(document.querySelector('[data-home-grid]'), 'New products', products.slice(0, 12));

    document.dispatchEvent(new CustomEvent('shopnepal:home-ready', { detail: { products, categories } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  ShopNepal.home = { mount, gridCard, showcaseCard };
})();
