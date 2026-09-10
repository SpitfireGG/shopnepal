/**
 * Shipping label.
 *
 * A 4x6-ish courier label built from the verified order record, with a real
 * Code 39 barcode for the tracking reference. Print scales it to a single
 * label; "print" is also how you save it as a PDF.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const METHOD_LABELS = { esewa: 'eSewa', khalti: 'Khalti', dummy: 'Test Gateway' };

  const uuidFromUrl = () => {
    const m = location.pathname.match(/\/label\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : new URLSearchParams(location.search).get('order');
  };

  /**
   * Tracking number, derived from the order number so it is stable and
   * readable: SHOPNEPAL + zero-padded order number.
   */
  const trackingNumber = (order) => `SHOPNEPAL${String(order.orderNumber).padStart(7, '0')}`;

  /** Volumetric-ish placeholder: 0.5kg per item, which a courier form expects. */
  const weight = (order) => (order.lines.reduce((n, l) => n + l.qty, 0) * 0.5).toFixed(1);

  function render(host, order) {
    const c = order.customer || {};
    const tracking = trackingNumber(order);
    const paid = order.paymentStatus === 'PAID';
    const itemCount = order.lines.reduce((n, l) => n + l.qty, 0);

    host.innerHTML = `
      <div class="doc-actions no-print">
        <button class="btn-primary" onclick="window.print()">
          <ion-icon name="print-outline"></ion-icon> Print label
        </button>
        <a href="/invoice/${encodeURIComponent(order.transactionUuid)}" class="btn-ghost">Invoice</a>
        <a href="/" class="btn-ghost">Back to shop</a>
      </div>

      <article class="doc label">

        <header class="label-head">
          <img src="/assets/images/logo/logo.svg" alt="ShopNepal" width="96" height="29">
          <div class="label-service">
            <strong>STANDARD</strong>
            <span>Inside valley</span>
          </div>
        </header>

        <div class="label-barcode">
          ${ShopNepal.barcode.toSVG(tracking, { narrow: 2, height: 70 })}
        </div>

        <section class="label-parties">
          <div class="label-to">
            <h2>Deliver to</h2>
            <p class="label-name">${escape(c.name || '-')}</p>
            <address>
              ${escape(c.address || '')}<br>
              ${escape([c.city, c.state].filter(Boolean).join(', '))}<br>
              ${escape(c.postcode || '')}<br>
              <strong>${escape(c.phone || '-')}</strong>
            </address>
          </div>

          <div class="label-from">
            <h2>From</h2>
            <address>
              ShopNepal Retail Pvt. Ltd.<br>
              Pulchowk, Lalitpur<br>
              Bagmati 44700<br>
              01-5555123
            </address>
          </div>
        </section>

        <section class="label-grid">
          <div><span>Order</span><strong>#${order.orderNumber}</strong></div>
          <div><span>Items</span><strong>${itemCount}</strong></div>
          <div><span>Weight</span><strong>${weight(order)} kg</strong></div>
          <div><span>Payment</span><strong>${escape(METHOD_LABELS[order.method] || order.method)}</strong></div>
          <div class="label-cod ${paid ? 'is-prepaid' : 'is-cod'}">
            <span>Amount</span>
            <strong>${paid ? 'PREPAID' : ShopNepal.formatNPR(order.totalAmount)}</strong>
          </div>
        </section>

        <section class="label-contents">
          <h2>Contents</h2>
          <ul>
            ${order.lines
              .map((l) => `<li><span>${escape(l.title)}${l.size ? ` (${escape(l.size)})` : ''}</span><strong>&times;${l.qty}</strong></li>`)
              .join('')}
          </ul>
        </section>

        <footer class="label-foot">
          <div class="label-ref">${ShopNepal.barcode.toSVG(`ORD${order.orderNumber}`, { narrow: 1, height: 34, showText: false })}</div>
          <p>Not delivered? Return to sender at the address above. Handle with care.</p>
        </footer>

      </article>`;
  }

  function renderMissing(host, message) {
    host.innerHTML = `
      <div class="pdp-empty">
        <ion-icon name="help-circle-outline"></ion-icon>
        <h1 class="pdp-title">Label unavailable</h1>
        <p>${escape(message)}</p>
        <a href="/" class="btn-primary">Back to the shop</a>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const host = document.querySelector('[data-label]');
    const uuid = uuidFromUrl();
    if (!uuid) return renderMissing(host, 'No order reference was given.');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(uuid)}`);
      if (!res.ok) return renderMissing(host, 'That order reference does not match anything.');

      const order = await res.json();
      document.title = `Label #${order.orderNumber} - ShopNepal`;
      render(host, order);
    } catch {
      renderMissing(host, 'We could not reach the server to load this label.');
    }
  });
})();
