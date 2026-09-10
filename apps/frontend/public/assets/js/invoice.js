/**
 * Invoice document.
 *
 * A print-ready A4 invoice rendered from the verified order record. "Download"
 * opens the browser's print dialogue, where Save as PDF produces the file -
 * that keeps the invoice a real document without shipping a PDF library.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const METHOD_LABELS = { esewa: 'eSewa', khalti: 'Khalti', dummy: 'Test Gateway' };

  const uuidFromUrl = () => {
    const m = location.pathname.match(/\/invoice\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : new URLSearchParams(location.search).get('order');
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  function render(host, order) {
    const c = order.customer || {};
    const method = METHOD_LABELS[order.method] || order.method;
    const paid = order.paymentStatus === 'PAID';

    host.innerHTML = `
      <div class="doc-actions no-print">
        <button class="btn-primary" onclick="window.print()">
          <ion-icon name="download-outline"></ion-icon> Download / print
        </button>
        <a href="/label/${encodeURIComponent(order.transactionUuid)}" class="btn-ghost">Shipping label</a>
        <a href="/" class="btn-ghost">Back to shop</a>
      </div>

      <article class="doc doc-invoice">

        <header class="doc-head">
          <div>
            <img src="/assets/images/logo/logo.svg" alt="ShopNepal" width="120" height="36">
            <p class="doc-org">
              ShopNepal Retail Pvt. Ltd.<br>
              Pulchowk, Lalitpur, Bagmati<br>
              VAT 601234567 &middot; support@shopnepal.com.np
            </p>
          </div>
          <div class="doc-title-block">
            <h1>Invoice</h1>
            <p class="doc-number">#${order.orderNumber}</p>
            <p class="doc-stamp ${paid ? 'is-paid' : 'is-due'}">${paid ? 'PAID' : 'UNPAID'}</p>
          </div>
        </header>

        <section class="doc-parties">
          <div>
            <h2>Billed to</h2>
            <address>
              ${escape(c.name || '-')}<br>
              ${escape(c.address || '')}<br>
              ${escape([c.city, c.state].filter(Boolean).join(', '))} ${escape(c.postcode || '')}<br>
              ${escape(c.phone || '')}<br>
              ${escape(c.email || '')}
            </address>
          </div>
          <div>
            <h2>Invoice details</h2>
            <dl class="doc-meta">
              <div><dt>Invoice date</dt><dd>${formatDate(order.createdAt)}</dd></div>
              <div><dt>Payment date</dt><dd>${formatDate(order.paidAt)}</dd></div>
              <div><dt>Method</dt><dd>${escape(method)}</dd></div>
              <div><dt>Reference</dt><dd>${escape(order.paymentRef || '-')}</dd></div>
              <div><dt>Order ID</dt><dd class="doc-mono">${escape(order.transactionUuid)}</dd></div>
            </dl>
          </div>
        </section>

        <table class="doc-table">
          <thead>
            <tr>
              <th>#</th><th>Item</th><th>Size</th>
              <th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.lines
              .map(
                (l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${escape(l.title)}<br><small class="doc-mono">${escape(l.id)}</small></td>
                <td>${escape(l.size || '-')}</td>
                <td class="num">${l.qty}</td>
                <td class="num">${ShopNepal.formatNPR(l.unitPrice)}</td>
                <td class="num">${ShopNepal.formatNPR(l.lineTotal)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>

        <div class="doc-totals">
          <dl>
            <div><dt>Subtotal</dt><dd>${ShopNepal.formatNPR(order.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>${ShopNepal.formatNPR(order.deliveryCharge)}</dd></div>
            <div class="doc-total-row"><dt>Total</dt><dd>${ShopNepal.formatNPR(order.totalAmount)}</dd></div>
          </dl>
        </div>

        <footer class="doc-foot">
          <p>Amount in words: <strong>${escape(inWords(order.totalAmount))} only</strong>.</p>
          <p>This is a computer-generated invoice and is valid without a signature.</p>
        </footer>

      </article>`;
  }

  /**
   * Rupees in words, on the Nepali/Indian scale (lakh, crore) - the convention
   * a printed invoice here is expected to use.
   */
  function inWords(amount) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const two = (n) => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : ''));
    const three = (n) => {
      const h = Math.floor(n / 100), r = n % 100;
      return (h ? ones[h] + ' hundred' + (r ? ' ' : '') : '') + (r ? two(r) : '');
    };

    let n = Math.round(Number(amount));
    if (!n) return 'zero rupees';

    const parts = [];
    const scales = [[10000000, 'crore'], [100000, 'lakh'], [1000, 'thousand']];
    for (const [value, name] of scales) {
      if (n >= value) {
        parts.push(three(Math.floor(n / value)) + ' ' + name);
        n %= value;
      }
    }
    if (n) parts.push(three(n));

    const words = parts.join(' ').trim();
    return 'rupees ' + words.charAt(0).toUpperCase() + words.slice(1);
  }

  function renderMissing(host, message) {
    host.innerHTML = `
      <div class="pdp-empty">
        <ion-icon name="help-circle-outline"></ion-icon>
        <h1 class="pdp-title">Invoice unavailable</h1>
        <p>${escape(message)}</p>
        <a href="/" class="btn-primary">Back to the shop</a>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const host = document.querySelector('[data-invoice]');
    const uuid = uuidFromUrl();
    if (!uuid) return renderMissing(host, 'No order reference was given.');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(uuid)}`);
      if (!res.ok) return renderMissing(host, 'That order reference does not match anything.');

      const order = await res.json();
      document.title = `Invoice #${order.orderNumber} - ShopNepal`;
      render(host, order);
    } catch {
      renderMissing(host, 'We could not reach the server to load this invoice.');
    }
  });
})();
