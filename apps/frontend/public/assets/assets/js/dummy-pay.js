/**
 * Offline test gateway - payment screen.
 *
 * Stands in for the eSewa/Khalti hosted pages. It carries the signed token
 * through and lets the server decide the outcome; nothing here can mark an
 * order paid on its own.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const token = new URLSearchParams(location.search).get('token');

  function renderError(host, message) {
    host.innerHTML = `
      <div class="pdp-empty">
        <ion-icon name="alert-circle-outline"></ion-icon>
        <h1 class="pdp-title">Payment link problem</h1>
        <p>${escape(message)}</p>
        <a href="/cart.html" class="btn-primary">Back to your bag</a>
      </div>`;
  }

  function render(host, session) {
    host.innerHTML = `
      <div class="gw">

        <header class="gw-head">
          <span class="gw-brand">ShopNepal <em>Test Gateway</em></span>
          <span class="gw-secure"><ion-icon name="lock-closed"></ion-icon> Simulated</span>
        </header>

        <div class="gw-body">

          <p class="gw-note">
            This is an offline test gateway. No real money moves and no bank or
            wallet is contacted &mdash; it exists so checkout can be demonstrated
            without an internet connection.
          </p>

          <dl class="gw-amount">
            <div><dt>Paying</dt><dd class="gw-total">${ShopNepal.formatNPR(session.totalAmount)}</dd></div>
            <div><dt>Order</dt><dd>#${session.orderNumber}</dd></div>
            ${session.customerName ? `<div><dt>Name</dt><dd>${escape(session.customerName)}</dd></div>` : ''}
          </dl>

          <form class="gw-form" data-gw-form novalidate>

            <label>
              <span class="pdp-field-label">MPIN</span>
              <input type="password" name="pin" inputmode="numeric" autocomplete="off"
                     placeholder="${escape(session.testPin)}" required>
            </label>

            <label>
              <span class="pdp-field-label">OTP</span>
              <input type="text" name="otp" inputmode="numeric" autocomplete="one-time-code"
                     placeholder="${escape(session.testOtp)}" required>
            </label>

            <p class="gw-hint">
              Test credentials &mdash; MPIN <strong>${escape(session.testPin)}</strong>,
              OTP <strong>${escape(session.testOtp)}</strong>.
              <button type="button" class="gw-fill" data-fill>Fill for me</button>
            </p>

            <p class="checkout-error" data-gw-error hidden></p>

            <button type="submit" class="btn-pay" data-gw-pay>
              Pay ${ShopNepal.formatNPR(session.totalAmount)}
            </button>

            <button type="button" class="gw-cancel" data-gw-cancel>Cancel payment</button>

          </form>

        </div>

      </div>`;

    wire(host, session);
  }

  function wire(host, session) {
    const form = host.querySelector('[data-gw-form]');
    const errorEl = host.querySelector('[data-gw-error]');
    const payBtn = host.querySelector('[data-gw-pay]');

    const showError = (message) => {
      errorEl.textContent = message;
      errorEl.hidden = false;
      payBtn.disabled = false;
      payBtn.classList.remove('is-busy');
    };

    // form.elements rather than form.pin: named access on the form itself is
    // shadowed by built-in properties for names like "action" or "submit".
    const field = (name) => form.elements[name];

    host.querySelector('[data-fill]').addEventListener('click', () => {
      field('pin').value = session.testPin;
      field('otp').value = session.testOtp;
    });

    async function send(body) {
      errorEl.hidden = true;
      payBtn.disabled = true;
      payBtn.classList.add('is-busy');

      try {
        const res = await fetch('/api/dummy/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, ...body }),
        });
        const payload = await res.json();

        if (!res.ok) return showError(payload.error || 'Payment failed.');
        window.location.href = payload.redirectUrl;
      } catch {
        showError('Could not reach the server.');
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      send({ pin: field('pin').value.trim(), otp: field('otp').value.trim() });
    });

    host.querySelector('[data-gw-cancel]').addEventListener('click', () => send({ outcome: 'fail' }));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const host = document.querySelector('[data-dummy-pay]');
    if (!token) return renderError(host, 'No payment token was given.');

    try {
      const res = await fetch(`/api/dummy/session?token=${encodeURIComponent(token)}`);
      const payload = await res.json();
      if (!res.ok) return renderError(host, payload.error || 'This payment link is not valid.');
      render(host, payload);
    } catch {
      renderError(host, 'Could not reach the server.');
    }
  });
})();
