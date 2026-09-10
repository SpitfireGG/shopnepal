/**
 * Admin - order list.
 *
 * The page itself is behind basic auth on the server, so the browser has
 * already authenticated by the time this runs.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const METHOD_LABELS = { esewa: 'eSewa', khalti: 'Khalti', dummy: 'Test Gateway' };

  const formatDateTime = (iso) =>
    iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  function statusPill(value, kind) {
    const slug = String(value || 'unknown').toLowerCase().replace(/[^a-z]+/g, '-');
    return `<span class="pill pill-${kind} pill-${slug}">${escape(value || 'unknown')}</span>`;
  }

  function render(host, orders) {
    if (!orders.length) {
      host.innerHTML = `
        <div class="pdp-empty">
          <ion-icon name="receipt-outline"></ion-icon>
          <h1 class="pdp-title">No orders yet</h1>
          <p>Orders appear here as soon as a customer checks out.</p>
          <a href="/" class="btn-primary">Go to the shop</a>
        </div>`;
      return;
    }

    const paid = orders.filter((o) => o.paymentStatus === 'PAID');
    const revenue = paid.reduce((sum, o) => sum + o.totalAmount, 0);

    host.innerHTML = `
      <div class="admin-head">
        <h1 class="title">Orders</h1>
        <a href="/" class="btn-ghost">View shop</a>
      </div>

      <div class="admin-stats">
        <div><span>Orders</span><strong>${orders.length}</strong></div>
        <div><span>Paid</span><strong>${paid.length}</strong></div>
        <div><span>Revenue</span><strong>${ShopNepal.formatNPR(revenue)}</strong></div>
        <div><span>Awaiting payment</span><strong>${orders.filter((o) => o.paymentStatus === 'PENDING').length}</strong></div>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order</th><th>Customer</th><th>Date</th>
              <th>Method</th><th>Payment</th><th>Status</th><th class="num">Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (o) => `
              <tr>
                <td><a href="/admin-order.html?order=${encodeURIComponent(o.transactionUuid)}"><strong>#${o.orderNumber}</strong></a></td>
                <td>
                  ${escape((o.customer && o.customer.name) || 'Guest')}
                  <br><small>${escape((o.customer && o.customer.email) || '')}</small>
                </td>
                <td>${formatDateTime(o.createdAt)}</td>
                <td>${escape(METHOD_LABELS[o.method] || o.method || '-')}</td>
                <td>${statusPill(o.paymentStatus, 'pay')}</td>
                <td>${statusPill(o.status, 'fulfil')}</td>
                <td class="num">${ShopNepal.formatNPR(o.totalAmount)}</td>
                <td class="admin-row-actions">
                  <a href="/admin-order.html?order=${encodeURIComponent(o.transactionUuid)}">Open</a>
                  <a href="/invoice/${encodeURIComponent(o.transactionUuid)}">Invoice</a>
                  <a href="/label/${encodeURIComponent(o.transactionUuid)}">Label</a>
                </td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const host = document.querySelector('[data-admin]');
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error();
      render(host, await res.json());
    } catch {
      host.innerHTML = '<p class="checkout-error">Could not load orders.</p>';
    }
  });
})();
