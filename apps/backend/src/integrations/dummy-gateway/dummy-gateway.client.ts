const dummy = require('../../../server/dummy-gateway');
export const DummyGatewayClient = {
  isEnabled: dummy.isEnabled,
  createToken: dummy.createToken,
  verifyToken: dummy.verifyToken,
  referenceFor: dummy.referenceFor,
  TEST_PIN: dummy.TEST_PIN,
  TEST_OTP: dummy.TEST_OTP,
};
