/**
 * Renders product.html for whichever slug is in the URL.
 *
 * Accepts both /product/<slug> (served by the Express route) and
 * /product.html?slug=<slug>, so the page still works when the site is opened
 * straight off disk without the server running.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  function slugFromUrl() {
    const fromQuery = new URLSearchParams(location.search).get('slug');
    if (fromQuery) return fromQuery;

    const match = location.pathname.match(/\/product\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  function stars(rating) {
    return Array.from({ length: 5 }, (_, i) =>
      `<ion-icon name="${i < rating ? 'star' : 'star-outline'}"></ion-icon>`
    ).join('');
  }

  function discountPct(product) {
    if (!product.compareAt || product.compareAt <= product.price) return null;
    return Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
  }

  function relatedFallback(slug){
    try{ return ShopNepal.related(slug,4); }catch{ return []; }
  }
  function renderRelated(slug) {
    const list = relatedFallback(slug);
    if(!list.length) return '<p style="color:var(--sonic-silver);font-size:var(--fs-8)">No related products.</p>';
    return list
      .map(
        (p) => `
        <div class="showcase">
          <a href="/product/${p.slug}" class="showcase-img-box">
            <img src="${p.images[0]}" alt="${escape(p.title)}" class="showcase-img" width="70">
          </a>
          <div class="showcase-content">
            <a href="/product/${p.slug}">
              <h4 class="showcase-title">${escape(p.title)}</h4>
            </a>
            <a href="/product/${p.slug}" class="showcase-category">${escape(p.category)}</a>
            <div class="price-box">
              <p class="price">${ShopNepal.formatNPR(p.price)}</p>
              ${p.compareAt ? `<del>${ShopNepal.formatNPR(p.compareAt)}</del>` : ''}
            </div>
          </div>
        </div>`
      )
      .join('');
  }

  function render(product) {
    const off = discountPct(product);

    document.title = `${product.title} - ShopNepal`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', product.description);

    document.querySelector('[data-product]').innerHTML = `
      <nav class="pdp-breadcrumb">
        <a href="/">Home</a>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <span>${escape(product.category)}</span>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <span>${escape(product.title)}</span>
      </nav>

      <div class="pdp">

        <div class="pdp-gallery">
          <div class="pdp-main-img">
            <img src="${product.images[0]}" alt="${escape(product.title)}" data-main-image width="600">
            ${product.badge ? `<p class="showcase-badge">${escape(product.badge)}</p>` : ''}
          </div>
          <div class="pdp-thumbs">
            ${product.images
              .map(
                (src, i) => `
              <button class="pdp-thumb${i === 0 ? ' is-active' : ''}" data-thumb="${src}">
                <img src="${src}" alt="${escape(product.title)} view ${i + 1}" width="90">
              </button>`
              )
              .join('')}
          </div>
        </div>

        <div class="pdp-info">

          <a href="/" class="showcase-category">${escape(product.category)}</a>
          <h1 class="pdp-title">${escape(product.title)}</h1>

          <div class="showcase-rating">${stars(product.rating)}</div>

          <div class="pdp-price-box">
            <p class="price">${ShopNepal.formatNPR(product.price)}</p>
            ${product.compareAt ? `<del>${ShopNepal.formatNPR(product.compareAt)}</del>` : ''}
            ${off ? `<span class="pdp-save">Save ${off}%</span>` : ''}
          </div>

          <p class="pdp-description">${escape(product.description)}</p>

          <ul class="pdp-meta">
            <li><span>SKU</span><strong>${escape(product.id)}</strong></li>
            <li><span>Availability</span><strong>${
              product.stock > 0 ? `In stock &mdash; ${product.stock} left` : 'Out of stock'
            }</strong></li>
          </ul>

          ${
            product.sizes
              ? `<div class="pdp-sizes">
                   <span class="pdp-field-label">Size</span>
                   <div class="pdp-size-list">
                     ${product.sizes
                       .map(
                         (s, i) =>
                           `<button class="pdp-size${i === 0 ? ' is-active' : ''}" data-size="${escape(s)}">${escape(s)}</button>`
                       )
                       .join('')}
                   </div>
                 </div>`
              : ''
          }

          <div class="pdp-buy">
            <div class="pdp-qty">
              <button data-qty-step="-1" aria-label="Decrease quantity">&minus;</button>
              <input type="number" value="1" min="1" max="${product.stock}" data-qty aria-label="Quantity">
              <button data-qty-step="1" aria-label="Increase quantity">+</button>
            </div>

            <button class="btn-primary" data-add ${product.stock ? '' : 'disabled'}>
              <ion-icon name="bag-add-outline"></ion-icon>
              Add to bag
            </button>

            <button class="btn-esewa" data-buy-now ${product.stock ? '' : 'disabled'}>
              Buy now with eSewa
            </button>
          </div>

        </div>

      </div>

      <div class="product-showcase pdp-related">
        <h2 class="title">You may also like</h2>
        <div class="showcase-wrapper has-scrollbar">
          <div class="showcase-container">
            ${renderRelated(product.slug)}
          </div>
        </div>
      </div>`;

    wire(product);
  }

  function wire(product) {
    const root = document.querySelector('[data-product]');
    const qtyInput = root.querySelector('[data-qty]');
    const mainImage = root.querySelector('[data-main-image]');

    const currentSize = () => {
      const active = root.querySelector('.pdp-size.is-active');
      return active ? active.getAttribute('data-size') : null;
    };
    const currentQty = () => Math.max(1, Math.min(Number(qtyInput.value) || 1, product.stock));

    root.querySelectorAll('[data-thumb]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mainImage.src = btn.getAttribute('data-thumb');
        root.querySelectorAll('.pdp-thumb').forEach((t) => t.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    root.querySelectorAll('.pdp-size').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.pdp-size').forEach((s) => s.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    root.querySelectorAll('[data-qty-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = Number(btn.getAttribute('data-qty-step'));
        qtyInput.value = Math.max(1, Math.min(currentQty() + step, product.stock));
      });
    });

    root.querySelector('[data-add]').addEventListener('click', () => {
      ShopNepal.cart.add(product.id, currentQty(), currentSize());
      ShopNepal.flashMessage(`${product.title} added to your bag`);
    });

    root.querySelector('[data-buy-now]').addEventListener('click', () => {
      ShopNepal.cart.add(product.id, currentQty(), currentSize());
      window.location.href = '/cart.html#checkout';
    });
  }

  function renderNotFound(slug) {
    document.querySelector('[data-product]').innerHTML = `
      <div class="pdp-empty">
        <ion-icon name="help-circle-outline"></ion-icon>
        <h1 class="pdp-title">We couldn't find that product</h1>
        <p>${slug ? `Nothing here matches <strong>${escape(slug)}</strong>.` : 'No product was specified.'}</p>
        <a href="/" class="btn-primary">Back to the shop</a>
      </div>`;
  }

  async function resolveProduct(slug){
    let p = slug ? ShopNepal.bySlug(slug) : null;
    if(p) return p;
    try{
      const r = await fetch('/api/products/'+encodeURIComponent(slug));
      if(r.ok) return await r.json();
    }catch{}
    return null;
  }
  document.addEventListener('DOMContentLoaded', async () => {
    const slug = slugFromUrl();
    const product = await resolveProduct(slug);
    if (product) render(product);
    else renderNotFound(slug);
  });
})();
