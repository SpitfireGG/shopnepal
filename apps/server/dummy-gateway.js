/**
 * Offline test gateway.
 *
 * A local stand-in for eSewa/Khalti that needs no internet and no third party,
 * so a demo still works when the wifi does not. It deliberately mirrors the
 * real gateways' shape rather than shortcutting them:
 *
 *   1. checkout creates the order and sends the browser to /payment/dummy
 *   2. a mock gateway screen asks for a PIN and an OTP
 *   3. "pay" comes back to /payment/dummy/complete with a SIGNED token
 *   4. the token is verified server-side before the order is marked paid
 *
 * Step 4 is the point. Without it the "paid" callback would be a plain URL
 * anyone could type in to mark any order paid, which is exactly the flaw the
 * real integrations are written to avoid.
 *
 * DISABLED UNLESS OPTED IN. It settles orders without money moving, so it must
 * never be reachable on a production site: ENABLE_DUMMY_GATEWAY must be true,
 * and it refuses to run under NODE_ENV=production regardless.
 */

'use strict';

const crypto = require('crypto');

/** The PIN and OTP the mock screen accepts, so the demo has something to type. */
const TEST_PIN = '1111';
const TEST_OTP = '123456';

/** Tokens are short-lived, like a real gateway session. */
const TOKEN_TTL_MS = 30 * 60 * 1000;

function isEnabled() {
  if (process.env.NODE_ENV === 'production') return false;
  return String(process.env.ENABLE_DUMMY_GATEWAY || '').toLowerCase() === 'true';
}

/**
 * Signing key for completion tokens.
 *
 * Falls back to the admin password so a default install still has a secret;
 * it never leaves the server either way.
 */
function secret() {
  const key = process.env.DUMMY_GATEWAY_SECRET || process.env.ADMIN_PASSWORD;
  if (!key) throw new Error('Set DUMMY_GATEWAY_SECRET (or ADMIN_PASSWORD) to use the test gateway.');
  return key;
}

const sign = (message) => crypto.createHmac('sha256', secret()).update(message).digest('base64url');

/**
 * A token binding one order to one amount, with an expiry.
 * Format: <transactionUuid>.<totalAmount>.<expiry>.<signature>
 */
function createToken({ transactionUuid, totalAmount }) {
  const expires = Date.now() + TOKEN_TTL_MS;
  const message = `${transactionUuid}.${totalAmount}.${expires}`;
  return `${message}.${sign(message)}`;
}

/**
 * Verify and unpack a completion token.
 * Returns { transactionUuid, totalAmount } or null if it is not trustworthy.
 */
function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 4) return null;

  const [transactionUuid, totalAmount, expires, signature] = parts;
  const expected = sign(`${transactionUuid}.${totalAmount}.${expires}`);

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  if (Number(expires) < Date.now()) return null;

  return { transactionUuid, totalAmount: Number(totalAmount) };
}

/** A gateway-style reference, so receipts and the admin have something to show. */
function referenceFor(orderNumber) {
  return `TEST${String(orderNumber).padStart(5, '0')}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

module.exports = { isEnabled, createToken, verifyToken, referenceFor, TEST_PIN, TEST_OTP, TOKEN_TTL_MS };
