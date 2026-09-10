/**
 * eSewa ePay v2 - signing and verification.
 *
 * The merchant secret never leaves this module. The browser only ever receives
 * the finished form payload (which is safe to expose: it is signed, and any
 * tampering invalidates the signature).
 *
 * Flow:
 *   1. buildPaymentPayload()  -> browser POSTs it as a form to eSewa
 *   2. customer pays on eSewa, is redirected back to success_url?data=<base64>
 *   3. decodeCallback() + verifyCallbackSignature() -> is this really eSewa?
 *   4. checkTransactionStatus() -> ask eSewa directly, the authoritative answer
 *
 * Step 4 is what actually settles it. A signature only proves the message came
 * from eSewa; the status API proves the money moved.
 */

'use strict';

const crypto = require('crypto');

const ENDPOINTS = {
  test: {
    form: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    status: 'https://rc.esewa.com.np/api/epay/transaction/status/',
  },
  production: {
    form: 'https://epay.esewa.com.np/api/epay/main/v2/form',
    status: 'https://epay.esewa.com.np/api/epay/transaction/status/',
  },
};

/** eSewa signs exactly these fields, in exactly this order. */
const SIGNED_FIELDS = ['total_amount', 'transaction_uuid', 'product_code'];

function config() {
  const env = process.env.ESEWA_ENV === 'production' ? 'production' : 'test';
  const secretKey = process.env.ESEWA_SECRET_KEY;
  const productCode = process.env.ESEWA_PRODUCT_CODE;

  if (!secretKey || !productCode) {
    throw new Error(
      'ESEWA_SECRET_KEY and ESEWA_PRODUCT_CODE must be set. Copy .env.example to .env.'
    );
  }
  return { env, secretKey, productCode, ...ENDPOINTS[env] };
}

/**
 * Build the `field=value,field=value` string eSewa expects and HMAC it.
 *
 * The values must be stringified exactly as they are sent in the form - eSewa
 * re-signs the literal strings it receives, so "100" and "100.0" are different
 * messages and only one of them will match.
 */
function sign(values, secretKey, fields = SIGNED_FIELDS) {
  const message = fields.map((f) => `${f}=${values[f]}`).join(',');
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
}

/**
 * Assemble the signed form payload for a given order.
 *
 * `amount` and the charge fields are integers (NPR has no practical subunit at
 * checkout) and total_amount must equal their sum exactly, or eSewa rejects it.
 */
function buildPaymentPayload({ amount, taxAmount = 0, serviceCharge = 0, deliveryCharge = 0, transactionUuid, successUrl, failureUrl }) {
  const { productCode, secretKey, form } = config();

  const total = Number(amount) + Number(taxAmount) + Number(serviceCharge) + Number(deliveryCharge);

  const payload = {
    amount: String(amount),
    tax_amount: String(taxAmount),
    total_amount: String(total),
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: String(serviceCharge),
    product_delivery_charge: String(deliveryCharge),
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: SIGNED_FIELDS.join(','),
  };

  payload.signature = sign(payload, secretKey);

  return { action: form, fields: payload };
}

/** eSewa returns the result as base64-encoded JSON on the `data` query param. */
function decodeCallback(dataParam) {
  try {
    return JSON.parse(Buffer.from(String(dataParam), 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * Recompute the signature over whatever fields the response says were signed.
 *
 * Uses the raw string values from the response verbatim - eSewa may return
 * total_amount grouped as "1,020.0", and re-formatting it here would produce a
 * different message and a false mismatch.
 */
function verifyCallbackSignature(decoded) {
  if (!decoded || !decoded.signature || !decoded.signed_field_names) return false;

  const { secretKey } = config();
  const fields = String(decoded.signed_field_names).split(',');
  const expected = sign(decoded, secretKey, fields);

  const a = Buffer.from(expected);
  const b = Buffer.from(String(decoded.signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Ask eSewa what actually happened. This is the authoritative check and the
 * only one an order should be fulfilled on.
 *
 * Resolves to { status, ref_id, ... }. `status` is COMPLETE on success; other
 * values include PENDING, CANCELED, NOT_FOUND, AMBIGUOUS and the refund states.
 */
async function checkTransactionStatus({ transactionUuid, totalAmount }) {
  const { productCode, status: statusUrl } = config();

  const url = `${statusUrl}?product_code=${encodeURIComponent(productCode)}` +
    `&total_amount=${encodeURIComponent(totalAmount)}` +
    `&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`eSewa status check failed: HTTP ${res.status}`);

  return res.json();
}

module.exports = {
  config,
  buildPaymentPayload,
  decodeCallback,
  verifyCallbackSignature,
  checkTransactionStatus,
  SIGNED_FIELDS,
};
