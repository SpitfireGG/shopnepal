/**
 * Explains why a payment did not complete.
 *
 * The reason comes from our own server's redirect, not from eSewa directly, so
 * the set of values is closed and safe to map to copy.
 */

'use strict';

(function () {
  const MESSAGES = {
    cancelled: "You cancelled the payment on eSewa, so you have not been charged.",
    signature: "We couldn't verify that the response really came from eSewa, so the order was not accepted. If money left your account, contact us with your eSewa reference and we'll sort it out.",
    'unknown-order': "That payment doesn't match an order we have on record.",
    verification: "We couldn't reach eSewa to confirm the payment. If you were charged, don't pay again - contact us and we'll check.",
    PENDING: "eSewa hasn't settled this payment yet. It may complete shortly; please don't pay twice.",
    CANCELED: "The payment was cancelled, so you have not been charged.",
    NOT_FOUND: "eSewa has no record of that transaction.",
    AMBIGUOUS: "eSewa returned an unclear result for this payment. Please contact us before trying again.",
  };

  document.addEventListener('DOMContentLoaded', () => {
    const reason = new URLSearchParams(location.search).get('reason');
    const el = document.querySelector('[data-failure-reason]');
    if (el && reason && MESSAGES[reason]) el.textContent = MESSAGES[reason];
  });
})();
