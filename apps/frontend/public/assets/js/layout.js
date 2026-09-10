/**
 * Shared chrome for the pages added alongside index.html.
 *
 * index.html carries its own (very long) header and footer markup from the
 * original template. Rather than copy several hundred lines into each new page,
 * the product / cart / receipt pages get a trimmed header and footer injected
 * here, styled with the template's own classes so they read as the same site.
 */

'use strict';

(function () {
  const header = `
    <div class="header-main">
      <div class="container">

        <a href="/" class="header-logo">
          <img src="/assets/images/logo/logo.svg" alt="ShopNepal's logo" width="120" height="36">
        </a>

        <div class="header-search-container">
          <input type="search" name="search" class="search-field" placeholder="Enter your product name..." data-site-search>
          <button class="search-btn" aria-label="Search">
            <ion-icon name="search-outline"></ion-icon>
          </button>
        </div>

        <div class="header-user-actions">
          <a href="/cart.html" class="action-btn" aria-label="Your bag" style="position: relative;">
            <ion-icon name="bag-handle-outline"></ion-icon>
            <span class="count" data-cart-count>0</span>
          </a>
        </div>

      </div>
    </div>`;

  const footer = `
    <div class="footer-bottom">
      <div class="container">
        <img src="/assets/images/payment.png" alt="payment method" class="payment-img">
        <p class="copyright">
          Copyright &copy; <a href="/">ShopNepal</a> all rights reserved.
        </p>
      </div>
    </div>`;

  function mount() {
    const headerHost = document.querySelector('[data-site-header]');
    if (headerHost) {
      headerHost.className = 'header';
      headerHost.innerHTML = header;
    }

    const footerHost = document.querySelector('[data-site-footer]');
    if (footerHost) {
      footerHost.className = 'footer';
      footerHost.innerHTML = footer;
    }

    wireSearch();
    if (window.ShopNepal && window.ShopNepal.cart) {
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = window.ShopNepal.cart.count();
      });
    }
  }

  function wireSearch() {
    const field = document.querySelector('[data-site-search]');
    if (!field) return;
    const go = () => {
      const q = field.value.trim();
      if (!q) return;
      window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
    };
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    const btn = field.parentElement.querySelector('.search-btn');
    if (btn) btn.addEventListener('click', go);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
