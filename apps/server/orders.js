/**
 * Order store.
 *
 * A JSON file on disk, which is the right amount of database for this project:
 * it survives a restart, needs no service running, and the read/write surface
 * is small enough to swap for a real DB later without touching callers.
 *
 * Writes are serialised through a promise chain so two concurrent checkouts
 * cannot interleave a read-modify-write and lose an order or reuse a number.
 *
 * An order carries two independent statuses, the way a real shop does:
 *   paymentStatus - PENDING | PAID | FAILED | CANCELLED | <gateway status>
 *   status        - the fulfilment workflow: PENDING -> PROCESSING -> COMPLETED
 * Payment is settled by the gateway; fulfilment is moved by staff in the admin.
 */

'use strict';

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const FILE = path.join(__dirname, '..', 'data', 'orders.json');

/** Order numbers start here so a fresh install doesn't show "Order #1". */
const FIRST_ORDER_NUMBER = 1001;

const FULFILMENT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

let queue = Promise.resolve();

const emptyStore = () => ({ meta: { lastOrderNumber: FIRST_ORDER_NUMBER - 1 }, orders: {} });

async function readStore() {
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return emptyStore();
    throw err;
  }

  // Tolerate the earlier flat shape ({ [uuid]: order }).
  if (!raw.orders) {
    const orders = raw;
    const numbers = Object.values(orders).map((o) => o.orderNumber || 0);
    return {
      meta: { lastOrderNumber: Math.max(FIRST_ORDER_NUMBER - 1, ...numbers) },
      orders,
    };
  }
  return raw;
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  // Write-then-rename so a crash mid-write cannot truncate the store.
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2));
  await fs.rename(tmp, FILE);
}

/** Run `fn` with exclusive access to the store. */
function withLock(fn) {
  const run = queue.then(fn, fn);
  queue = run.then(() => {}, () => {});
  return run;
}

/**
 * Gateways require a unique reference per attempt, restricted to alphanumerics
 * and hyphens. This doubles as our internal order key.
 */
function newTransactionUuid() {
  const stamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  return `SHOPNEPAL-${stamp}-${crypto.randomBytes(3).toString('hex')}`;
}

async function create(order) {
  return withLock(async () => {
    const store = await readStore();

    const orderNumber = store.meta.lastOrderNumber + 1;
    store.meta.lastOrderNumber = orderNumber;

    store.orders[order.transactionUuid] = {
      ...order,
      orderNumber,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      paymentRef: null,
      paidAt: null,
      createdAt: new Date().toISOString(),
    };

    await writeStore(store);
    return store.orders[order.transactionUuid];
  });
}

async function get(transactionUuid) {
  const store = await readStore();
  return store.orders[transactionUuid] || null;
}

/** Newest first - what the admin list wants. */
async function list() {
  const store = await readStore();
  return Object.values(store.orders).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function update(transactionUuid, patch) {
  return withLock(async () => {
    const store = await readStore();
    const existing = store.orders[transactionUuid];
    if (!existing) return null;

    store.orders[transactionUuid] = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeStore(store);
    return store.orders[transactionUuid];
  });
}

/**
 * Mark an order paid. Fulfilment moves to PROCESSING at the same time, which is
 * where a paid-but-not-yet-shipped order sits.
 */
async function markPaid(transactionUuid, { paymentRef, gatewayStatus }) {
  return update(transactionUuid, {
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    paymentRef: paymentRef || null,
    gatewayStatus: gatewayStatus || null,
    paidAt: new Date().toISOString(),
  });
}

module.exports = {
  create,
  get,
  list,
  update,
  markPaid,
  newTransactionUuid,
  FULFILMENT_STATUSES,
};
