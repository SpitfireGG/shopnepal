/**
 * Cart and checkout.
 *
 * Checkout deliberately posts nothing but ids, quantities and sizes. The server
 * prices the order and starts the payment; the two gateways then differ:
 *
 *   eSewa  - hands back a signed form we POST at the top level, because eSewa
 *            redirects the browser and so it cannot be an XHR.
 *   Khalti - hands back a URL to send the browser to.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const DELIVERY_CHARGE = 100;
  const METHOD_KEY = 'shopnepal.method.v1';

  const METHODS = ['esewa', 'khalti', 'dummy'];

  const readMethod = () => {
    try {
      const saved = localStorage.getItem(METHOD_KEY);
      return METHODS.includes(saved) ? saved : 'esewa';
    } catch {
      return 'esewa';
    }
  };

  const saveMethod = (m) => {
    try {
      localStorage.setItem(METHOD_KEY, m);
    } catch {
      /* not important enough to fail checkout over */
    }
  };

  function render() {
    const lines = ShopNepal.cart.detailed();
    const host = document.querySelector('[data-cart-view]');

    if (!lines.length) {
      host.innerHTML = `
        <div class="pdp-empty">
          <ion-icon name="bag-outline"></ion-icon>
          <h1 class="pdp-title">Your bag is empty</h1>
          <p>Once you add something it will show up here.</p>
          <a href="/" class="btn-primary">Start shopping</a>
        </div>`;
      return;
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const total = subtotal + DELIVERY_CHARGE;
    const method = readMethod();

    host.innerHTML = `
      <h1 class="title cart-heading">Your bag</h1>

      <div class="cart-layout">

        <div class="cart-lines">
          ${lines.map(lineMarkup).join('')}
        </div>

        <aside class="cart-summary" id="checkout">

          <h2 class="showcase-heading">Order summary</h2>

          <dl class="cart-totals">
            <div><dt>Subtotal</dt><dd>${ShopNepal.formatNPR(subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>${ShopNepal.formatNPR(DELIVERY_CHARGE)}</dd></div>
            <div class="cart-total-row"><dt>Total</dt><dd>${ShopNepal.formatNPR(total)}</dd></div>
          </dl>

          <form class="checkout-form" data-checkout-form novalidate>

            <label>
              <span class="pdp-field-label">Full name</span>
              <input type="text" name="name" required autocomplete="name" placeholder="Gaurav Artist">
            </label>

            <label>
              <span class="pdp-field-label">Mobile</span>
              <input type="tel" name="phone" required autocomplete="tel" placeholder="98XXXXXXXX" pattern="9[0-9]{9}">
            </label>

            <label>
              <span class="pdp-field-label">Email</span>
              <input type="email" name="email" required autocomplete="email" placeholder="you@example.com">
            </label>

            <label>
              <span class="pdp-field-label">Street address</span>
              <textarea name="address" rows="2" required placeholder="Ward, tole"></textarea>
            </label>

            <div class="checkout-row">
              <label>
                <span class="pdp-field-label">City</span>
                <input type="text" name="city" required autocomplete="address-level2" placeholder="Lalitpur">
              </label>
              <label>
                <span class="pdp-field-label">Province</span>
                <input type="text" name="state" autocomplete="address-level1" placeholder="Bagmati">
              </label>
              <label>
                <span class="pdp-field-label">Postcode</span>
                <input type="text" name="postcode" autocomplete="postal-code" placeholder="44600">
              </label>
            </div>

            <fieldset class="pay-methods">
              <legend class="pdp-field-label">Payment method</legend>

              <label class="pay-method${method === 'esewa' ? ' is-active' : ''}">
                <input type="radio" name="method" value="esewa" ${method === 'esewa' ? 'checked' : ''}>
                <img src="/assets/images/esewa-logo.svg" alt="" width="64" height="18">
                <span>Pay with eSewa</span>
              </label>

              <label class="pay-method${method === 'khalti' ? ' is-active' : ''}">
                <input type="radio" name="method" value="khalti" ${method === 'khalti' ? 'checked' : ''}>
                <img src="/assets/images/khalti-logo.svg" alt="" width="64" height="18">
                <span>Pay with Khalti</span>
              </label>

              <label class="pay-method pay-method-test${method === 'dummy' ? ' is-active' : ''}">
                <input type="radio" name="method" value="dummy" ${method === 'dummy' ? 'checked' : ''}>
                <span class="pay-test-badge">TEST</span>
                <span>Test gateway <small>works offline, no real money</small></span>
              </label>
            </fieldset>

            <p class="checkout-error" data-checkout-error hidden></p>

            <button type="submit" class="btn-pay" data-pay>
              Pay ${ShopNepal.formatNPR(total)}
            </button>

            <p class="checkout-note">
              You'll be taken to the gateway to authorise the payment, then brought back here.
            </p>

          </form>

        </aside>

      </div>`;

    wire();
  }

  function lineMarkup(l) {
    return `
      <div class="cart-line" data-line-id="${escape(l.id)}" data-line-size="${escape(l.size || '')}">
        <a href="/product/${l.product.slug}" class="cart-line-img">
          <img src="${l.product.images[0]}" alt="${escape(l.product.title)}" width="90">
        </a>

        <div class="cart-line-info">
          <a href="/product/${l.product.slug}">
            <h3 class="showcase-title">${escape(l.product.title)}</h3>
          </a>
          <a href="/product/${l.product.slug}" class="showcase-category">${escape(l.product.category)}</a>
          ${l.size ? `<p class="cart-line-size">Size: <strong>${escape(l.size)}</strong></p>` : ''}
          <p class="price">${ShopNepal.formatNPR(l.unitPrice)}</p>
        </div>

        <div class="cart-line-actions">
          <div class="pdp-qty">
            <button type="button" data-line-step="-1" aria-label="Decrease quantity">&minus;</button>
            <input type="number" value="${l.qty}" min="1" max="${l.product.stock}" data-line-qty aria-label="Quantity">
            <button type="button" data-line-step="1" aria-label="Increase quantity">+</button>
          </div>
          <p class="cart-line-total">${ShopNepal.formatNPR(l.lineTotal)}</p>
          <button type="button" class="cart-line-remove" data-line-remove>
            <ion-icon name="trash-outline"></ion-icon> Remove
          </button>
        </div>
      </div>`;
  }

  function wire() {
    document.querySelectorAll('.cart-line').forEach((row) => {
      const id = row.getAttribute('data-line-id');
      const size = row.getAttribute('data-line-size') || null;
      const input = row.querySelector('[data-line-qty]');

      row.querySelectorAll('[data-line-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
          ShopNepal.cart.setQty(id, (Number(input.value) || 1) + Number(btn.getAttribute('data-line-step')), size);
          render();
        });
      });

      input.addEventListener('change', () => {
        ShopNepal.cart.setQty(id, input.value, size);
        render();
      });

      row.querySelector('[data-line-remove]').addEventListener('click', () => {
        ShopNepal.cart.remove(id, size);
        render();
      });
    });

    document.querySelectorAll('.pay-method input').forEach((radio) => {
      radio.addEventListener('change', () => {
        saveMethod(radio.value);
        document.querySelectorAll('.pay-method').forEach((el) => {
          el.classList.toggle('is-active', el.contains(radio) && radio.checked);
        });
      });
    });

    const form = document.querySelector('[data-checkout-form]');
    if (form) form.addEventListener('submit', pay);
  }

  async function pay(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const button = form.querySelector('[data-pay]');
    const errorEl = form.querySelector('[data-checkout-error]');

    const showError = (message) => {
      errorEl.textContent = message;
      errorEl.hidden = false;
      button.disabled = false;
      button.classList.remove('is-busy');
    };

    errorEl.hidden = true;
    if (!form.reportValidity()) return;

    button.disabled = true;
    button.classList.add('is-busy');

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: ShopNepal.cart.items().map(({ id, qty, size }) => ({ id, qty, size })),
        }),
      });

      const payload = await res.json();
      if (!res.ok) return showError(payload.error || 'Could not start the payment.');

      // The bag is only cleared once the gateway confirms; if the customer
      // backs out mid-payment their cart is still here.
      if (payload.redirectUrl) window.location.href = payload.redirectUrl;
      else submitToEsewa(payload);
    } catch {
      showError('Could not reach the server. Make sure it is running (npm start).');
    }
  }

  /** eSewa needs a top-level form POST so it can redirect the browser. */
  function submitToEsewa({ action, fields }) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  document.addEventListener('DOMContentLoaded', render);
})();
