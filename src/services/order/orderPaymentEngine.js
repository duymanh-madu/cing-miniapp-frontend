const crypto =
  require("crypto");

/**
 * =====================================================
 * ORDER PAYMENT ENGINE
 * =====================================================
 */

const PAYMENT_STATUS = {

  PENDING:
    "pending",

  PAID:
    "paid",

  FAILED:
    "failed",

  REFUNDED:
    "refunded",

};

function createPaymentSession({

  orderId,

  total,

}) {

  return {

    paymentId:
      crypto.randomUUID(),

    orderId,

    total,

    status:
      PAYMENT_STATUS
        .PENDING,

    createdAt:
      new Date().toISOString(),

  };

}

module.exports = {

  PAYMENT_STATUS,

  createPaymentSession,

};