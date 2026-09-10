/**
 * Order received page.
 *
 * Reads the order back from the server rather than from the URL, so what the
 * customer sees is the verified record - not whatever the redirect claimed.
 * The bag is cleared here, once the order is confirmed paid.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const METHOD_LABELS = { esewa: 'eSewa', khalti: 'Khalti', dummy: 'Test Gateway' };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  function renderMissing(host, message) {
    host.innerHTML = `
      <div class="pdp-empty">
        <ion-icon name="help-circle-outline"></ion-icon>
        <h1 class="pdp-title">We can't find that order</h1>
        <p>${escape(message)}</p>
        <a href="/" class="btn-primary">Back to the shop</a>
      </div>`;
  }

  function renderReceived(host, order) {
    ShopNepal.cart.clear();

    const c = order.customer || {};
    const method = METHOD_LABELS[order.method] || order.method;

    host.innerHTML = `
      <p class="received-thanks">Thank you. Your order has been received.</p>

      <ul class="received-summary">
        <li><span>Order number</span><strong>${order.orderNumber}</strong></li>
        <li><span>Date</span><strong>${formatDate(order.createdAt)}</strong></li>
        <li><span>Email</span><strong>${escape(c.email || '-')}</strong></li>
        <li><span>Total</span><strong>${ShopNepal.formatNPR(order.totalAmount)}</strong></li>
        <li><span>Payment method</span><strong>${escape(method)}</strong></li>
      </ul>

      <section class="order-panel">
        <h2>Order details</h2>
        <table class="order-table">
          <thead>
            <tr><th>Product</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${order.lines
              .map(
                (l) => `
              <tr>
                <td>
                  <a href="/product/${l.slug}">${escape(l.title)}</a>${l.size ? ` <em>(${escape(l.size)})</em>` : ''}
                  <strong class="order-qty">&times; ${l.qty}</strong>
                </td>
                <td>${ShopNepal.formatNPR(l.lineTotal)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr><th>Subtotal</th><td>${ShopNepal.formatNPR(order.subtotal)}</td></tr>
            <tr><th>Delivery</th><td>${ShopNepal.formatNPR(order.deliveryCharge)}</td></tr>
            <tr><th>Total</th><td>${ShopNepal.formatNPR(order.totalAmount)}</td></tr>
            <tr><th>Payment method</th><td>${escape(method)}</td></tr>
          </tfoot>
        </table>
      </section>

      <section class="order-panel">
        <h2>Billing address</h2>
        <address class="order-address">
          ${escape(c.name || '')}<br>
          ${escape(c.address || '')}<br>
          ${escape([c.city, c.state].filter(Boolean).join(', '))}<br>
          ${escape(c.postcode || '')}
          <span class="order-address-contact">
            <ion-icon name="call-outline"></ion-icon> ${escape(c.phone || '-')}
          </span>
          <span class="order-address-contact">
            <ion-icon name="mail-outline"></ion-icon> ${escape(c.email || '-')}
          </span>
        </address>
      </section>

      <div class="receipt-actions">
        <a href="/invoice/${encodeURIComponent(order.transactionUuid)}" class="btn-primary">
          <ion-icon name="document-text-outline"></ion-icon> View invoice
        </a>
        <a href="/label/${encodeURIComponent(order.transactionUuid)}" class="btn-ghost">
          <ion-icon name="pricetag-outline"></ion-icon> Shipping label
        </a>
        <a href="/" class="btn-ghost">Continue shopping</a>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const host = document.querySelector('[data-receipt]');
    const uuid = new URLSearchParams(location.search).get('order');

    if (!uuid) return renderMissing(host, 'No order reference was given.');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(uuid)}`);
      if (!res.ok) return renderMissing(host, 'That order reference does not match anything.');

      const order = await res.json();
      if (order.paymentStatus !== 'PAID') {
        return renderMissing(host, `This order is currently marked ${String(order.paymentStatus).toLowerCase()}.`);
      }
      renderReceived(host, order);
    } catch {
      renderMissing(host, 'We could not reach the server to confirm your order.');
    }
  });
})();
