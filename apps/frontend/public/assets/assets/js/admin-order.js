/**
 * Admin - single order.
 *
 * Mirrors the shape of a shop admin order screen: payment provenance at the
 * top, an editable fulfilment status, the line items, and the billing details.
 * Payment status is read-only here - that belongs to the gateway.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const METHOD_LABELS = { esewa: 'eSewa', khalti: 'Khalti', dummy: 'Test Gateway' };
  const STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

  const uuidFromUrl = () => {
    // The server serves this page statically, so ?order= is the working form;
    // the path form is kept in case a /admin/orders/<uuid> route is added.
    const fromQuery = new URLSearchParams(location.search).get('order');
    if (fromQuery) return fromQuery;
    const m = location.pathname.match(/\/admin\/orders\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  };

  const longDateTime = (iso) =>
    iso
      ? new Date(iso).toLocaleString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
        })
      : null;

  function paymentLine(order) {
    const method = METHOD_LABELS[order.method] || order.method;

    if (order.paymentStatus !== 'PAID') {
      return `Payment via ${escape(method)} &mdash; <strong>${escape(order.paymentStatus)}</strong>. Customer IP: ${escape(order.customerIp || '-')}`;
    }
    return `Payment via ${escape(method)} ${order.paymentRef ? `(${escape(order.paymentRef)})` : ''}. ` +
      `Paid on ${escape(longDateTime(order.paidAt) || 'unknown date')}. Customer IP: ${escape(order.customerIp || '-')}`;
  }

  function render(host, order) {
    const c = order.customer || {};

    host.innerHTML = `
      <div class="admin-head">
        <div>
          <h1 class="title">Order #${order.orderNumber}</h1>
          <p class="admin-payment-line">${paymentLine(order)}</p>
        </div>
        <a href="/admin" class="btn-ghost">All orders</a>
      </div>

      <div class="admin-order-grid">

        <section class="admin-panel">
          <h2>General</h2>

          <label class="admin-field">
            <span class="pdp-field-label">Date created</span>
            <input type="text" value="${escape(new Date(order.createdAt).toLocaleString('en-GB'))}" readonly>
          </label>

          <label class="admin-field">
            <span class="pdp-field-label">Status</span>
            <select data-status>
              ${STATUSES.map((s) => `<option value="${s}"${s === order.status ? ' selected' : ''}>${s.charAt(0) + s.slice(1).toLowerCase()}</option>`).join('')}
            </select>
          </label>

          <label class="admin-field">
            <span class="pdp-field-label">Customer</span>
            <input type="text" value="${escape(c.name || 'Guest')}${c.email ? ` (${escape(c.email)})` : ''}" readonly>
          </label>

          <label class="admin-field">
            <span class="pdp-field-label">Payment status</span>
            <input type="text" value="${escape(order.paymentStatus)}" readonly>
          </label>

          <div class="admin-actions">
            <button class="btn-primary" data-save>Save order</button>
            <span class="admin-saved" data-saved hidden>Saved</span>
          </div>
        </section>

        <section class="admin-panel">
          <h2>Billing</h2>
          <address class="admin-address">
            ${escape(c.name || '-')}<br>
            ${escape(c.address || '')}<br>
            ${escape(c.city || '')}<br>
            ${escape(c.state || '')}<br>
            ${escape(c.postcode || '')}
          </address>

          <h3>Email address</h3>
          <p><a href="mailto:${escape(c.email || '')}">${escape(c.email || '-')}</a></p>

          <h3>Phone</h3>
          <p><a href="tel:${escape(c.phone || '')}">${escape(c.phone || '-')}</a></p>

          <div class="admin-doc-links">
            <a href="/invoice/${encodeURIComponent(order.transactionUuid)}" class="btn-ghost">Invoice</a>
            <a href="/label/${encodeURIComponent(order.transactionUuid)}" class="btn-ghost">Shipping label</a>
          </div>
        </section>

      </div>

      <section class="admin-panel">
        <h2>Items</h2>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Item</th><th>Size</th><th class="num">Cost</th><th class="num">Qty</th><th class="num">Total</th></tr>
            </thead>
            <tbody>
              ${order.lines
                .map(
                  (l) => `
                <tr>
                  <td><a href="/product/${l.slug}">${escape(l.title)}</a><br><small>${escape(l.id)}</small></td>
                  <td>${escape(l.size || '-')}</td>
                  <td class="num">${ShopNepal.formatNPR(l.unitPrice)}</td>
                  <td class="num">${l.qty}</td>
                  <td class="num">${ShopNepal.formatNPR(l.lineTotal)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr><th colspan="4">Subtotal</th><td class="num">${ShopNepal.formatNPR(order.subtotal)}</td></tr>
              <tr><th colspan="4">Delivery</th><td class="num">${ShopNepal.formatNPR(order.deliveryCharge)}</td></tr>
              <tr><th colspan="4">Total</th><td class="num"><strong>${ShopNepal.formatNPR(order.totalAmount)}</strong></td></tr>
            </tfoot>
          </table>
        </div>
      </section>`;

    wire(host, order);
  }

  function wire(host, order) {
    const select = host.querySelector('[data-status]');
    const button = host.querySelector('[data-save]');
    const saved = host.querySelector('[data-saved]');

    button.addEventListener('click', async () => {
      button.disabled = true;
      saved.hidden = true;

      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.transactionUuid)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: select.value }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Save failed');
        }

        saved.textContent = 'Saved';
        saved.hidden = false;
      } catch (err) {
        saved.textContent = err.message;
        saved.hidden = false;
      } finally {
        button.disabled = false;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const host = document.querySelector('[data-admin-order]');
    const uuid = uuidFromUrl();
    if (!uuid) return (host.innerHTML = '<p class="checkout-error">No order specified.</p>');

    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(uuid)}`);
      if (!res.ok) throw new Error();
      const order = await res.json();
      document.title = `Order #${order.orderNumber} - ShopNepal admin`;
      render(host, order);
    } catch {
      host.innerHTML = '<p class="checkout-error">Could not load that order.</p>';
    }
  });
})();
