const {

  validateOrderPayload,

} = require(
  "./orderValidationEngine"
);

const {

  calculateOrderPricing,

} = require(
  "./orderPricingEngine"
);

const {

  emitOrderUpdate,

} = require(
  "./orderRealtimeEngine"
);

const {

  trackOrderCreated,

} = require(
  "./orderAnalyticsEngine"
);

const {

  enqueueOrder,

} = require(
  "./orderQueueEngine"
);

/**
 * =====================================================
 * ORDER LIFECYCLE ENGINE
 * =====================================================
 */

async function createOrder({

  order,

}) {

  validateOrderPayload(
    order
  );

  const pricing =
    calculateOrderPricing({

      items:
        order.items,

      shippingFee:
        order.shippingFee,

      discount:
        order.discount,

    });

  const finalOrder = {

    ...order,

    pricing,

    createdAt:
      new Date().toISOString(),

  };

  enqueueOrder(
    finalOrder
  );

  trackOrderCreated();

  emitOrderUpdate({

    orderId:
      order.id,

    status:
      "created",

    payload:
      finalOrder,

  });

  return finalOrder;

}

module.exports = {

  createOrder,

};