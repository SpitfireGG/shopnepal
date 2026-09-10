/**
 * ShopNepal - cart.
 *
 * Kept in localStorage as [{ id, qty, size }] and nothing else. Titles and
 * prices are resolved from the catalogue at render time, so a price change
 * never leaves a stale figure sitting in someone's browser - and the server
 * re-prices everything again at checkout regardless.
 *
 * Depends on products.js being loaded first.
 */

'use strict';

(function () {
  const KEY = 'shopnepal.cart.v1';
  const ShopNepal = (window.ShopNepal = window.ShopNepal || {});

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(parsed) ? parsed.filter((i) => i && i.id) : [];
    } catch {
      // Private mode, cleared storage, corrupt value - start empty.
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* Storage full or blocked; the cart just won't persist. */
    }
    render();
    window.dispatchEvent(new CustomEvent('shopnepal:cart-changed', { detail: items }));
  }

  /** Same product in a different size is a separate line. */
  const sameLine = (a, id, size) => a.id === id && (a.size || null) === (size || null);

  const cart = {
    items: read,

    /** Cart lines joined to catalogue data. Unknown ids are dropped. */
    detailed() {
      return read()
        .map((line) => {
          const product = ShopNepal.byId(line.id);
          if (!product) return null;
          return {
            ...line,
            product,
            unitPrice: product.price,
            lineTotal: product.price * line.qty,
          };
        })
        .filter(Boolean);
    },

    add(id, qty = 1, size = null) {
      const product = ShopNepal.byId(id);
      if (!product) return false;

      const items = read();
      const existing = items.find((i) => sameLine(i, id, size));
      const wanted = (existing ? existing.qty : 0) + Number(qty);
      const capped = Math.max(1, Math.min(wanted, product.stock, 99));

      if (existing) existing.qty = capped;
      else items.push({ id, qty: capped, size: size || null });

      write(items);
      return true;
    },

    setQty(id, qty, size = null) {
      const product = ShopNepal.byId(id);
      const items = read();
      const line = items.find((i) => sameLine(i, id, size));
      if (!line) return;

      const next = Math.floor(Number(qty));
      if (!Number.isFinite(next) || next < 1) return cart.remove(id, size);

      line.qty = Math.min(next, product ? product.stock : 99, 99);
      write(items);
    },

    remove(id, size = null) {
      write(read().filter((i) => !sameLine(i, id, size)));
    },

    clear() {
      write([]);
    },

    count() {
      return read().reduce((n, i) => n + i.qty, 0);
    },

    subtotal() {
      return cart.detailed().reduce((sum, l) => sum + l.lineTotal, 0);
    },
  };

  /** Keep every [data-cart-count] badge on the page in step. */
  function render() {
    const n = cart.count();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = n;
    });
  }

  /**
   * Brief confirmation after adding something, reusing the template's existing
   * toast styling so it looks native rather than bolted on.
   */
  function flash(message) {
    let el = document.querySelector('[data-cart-flash]');
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('data-cart-flash', '');
      el.className = 'cart-flash';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(flash.timer);
    flash.timer = setTimeout(() => el.classList.remove('is-visible'), 2200);
  }

  /**
   * Wire any element carrying data-add-to-cart="<product id>". Delegated, so
   * it covers cards rendered after load (related products, search results).
   */
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-add-to-cart]');
    if (!trigger) return;

    event.preventDefault();
    const id = trigger.getAttribute('data-add-to-cart');
    const size = trigger.getAttribute('data-size') || null;
    const qty = Number(trigger.getAttribute('data-qty') || 1);

    if (cart.add(id, qty, size)) {
      const product = ShopNepal.byId(id);
      flash(`${product.title} added to your bag`);
    }
  });

  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();

  ShopNepal.cart = cart;
  ShopNepal.flashMessage = flash;
})();
