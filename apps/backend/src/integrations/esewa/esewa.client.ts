const esewa = require('../../../server/esewa');
export const EsewaClient = {
  buildPaymentPayload: esewa.buildPaymentPayload,
  decodeCallback: esewa.decodeCallback,
  verifyCallbackSignature: esewa.verifyCallbackSignature,
  checkTransactionStatus: esewa.checkTransactionStatus,
  config: esewa.config,
};
