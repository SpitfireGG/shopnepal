/**
 * Khalti ePayment API v2 - initiate and verify.
 *
 * Unlike eSewa there is no HMAC signing here: the secret key authenticates the
 * server-to-server calls, so it must never reach the browser. The flow is:
 *
 *   1. initiatePayment() -> Khalti returns a pidx and a payment_url
 *   2. browser is redirected to payment_url and pays
 *   3. Khalti redirects back to return_url with ?pidx=...&status=...
 *   4. lookupPayment(pidx) -> the authoritative answer
 *
 * Step 4 matters: the query string on the redirect is attacker-controllable,
 * so an order is only ever settled on what the lookup call reports.
 *
 * Khalti works in PAISA. Our catalogue is in whole rupees, so every amount
 * crossing this boundary is multiplied or divided by 100 exactly once.
 */

'use strict';

const ENDPOINTS = {
  test: 'https://dev.khalti.com/api/v2/epayment',
  production: 'https://khalti.com/api/v2/epayment',
};

/** Khalti rejects anything under Rs. 10. */
const MIN_RUPEES = 10;

const toPaisa = (rupees) => Math.round(Number(rupees) * 100);
const toRupees = (paisa) => Number(paisa) / 100;

function config() {
  const env = process.env.KHALTI_ENV === 'production' ? 'production' : 'test';
  const secretKey = process.env.KHALTI_SECRET_KEY;

  if (!secretKey) {
    throw new Error('KHALTI_SECRET_KEY must be set. Copy .env.example to .env.');
  }
  return { env, secretKey, base: ENDPOINTS[env] };
}

async function call(path, payload) {
  const { secretKey, base } = config();

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `key ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Khalti returned a non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    // Khalti reports field errors as arrays, e.g. { amount: ["..."] }.
    const detail =
      body.detail ||
      Object.entries(body)
        .filter(([, v]) => Array.isArray(v))
        .map(([k, v]) => `${k}: ${v.join(' ')}`)
        .join('; ') ||
      text.slice(0, 200);
    throw new Error(`Khalti ${path} failed (HTTP ${res.status}): ${detail}`);
  }

  return body;
}

/**
 * Ask Khalti to open a payment session.
 *
 * Resolves to { pidx, paymentUrl, expiresAt }; the caller stores the pidx
 * against the order and sends the browser to paymentUrl.
 */
async function initiatePayment({ totalAmount, orderId, orderName, returnUrl, websiteUrl, customer = {} }) {
  if (Number(totalAmount) < MIN_RUPEES) {
    throw new Error(`Khalti requires at least Rs. ${MIN_RUPEES}.`);
  }

  const body = await call('/initiate/', {
    return_url: returnUrl,
    website_url: websiteUrl,
    amount: toPaisa(totalAmount),
    purchase_order_id: orderId,
    purchase_order_name: orderName,
    customer_info: {
      name: customer.name || 'Customer',
      email: customer.email || '',
      phone: customer.phone || '',
    },
  });

  return { pidx: body.pidx, paymentUrl: body.payment_url, expiresAt: body.expires_at };
}

/**
 * The authoritative status of a payment.
 *
 * Resolves to { status, transactionId, totalAmount (rupees), fee, refunded }.
 * `status` is 'Completed' on success; other values include Pending, Initiated,
 * Refunded, Expired and 'User canceled'.
 */
async function lookupPayment(pidx) {
  const body = await call('/lookup/', { pidx });

  return {
    pidx: body.pidx,
    status: body.status,
    transactionId: body.transaction_id || null,
    totalAmount: toRupees(body.total_amount),
    fee: toRupees(body.fee || 0),
    refunded: Boolean(body.refunded),
  };
}

module.exports = { config, initiatePayment, lookupPayment, toPaisa, toRupees, MIN_RUPEES };
