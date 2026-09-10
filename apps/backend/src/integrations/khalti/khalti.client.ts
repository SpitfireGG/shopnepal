const khalti = require('../../../server/khalti');
export const KhaltiClient = {
  initiatePayment: khalti.initiatePayment,
  lookupPayment: khalti.lookupPayment,
  config: khalti.config,
};
