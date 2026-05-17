/**
 * =====================================================
 * ORDER VALIDATION ENGINE
 * =====================================================
 */

function validateOrderPayload(

  order

) {

  if (!order) {

    throw new Error(
      "Order payload required"
    );

  }

  if (
    !Array.isArray(
      order.items
    )
  ) {

    throw new Error(
      "Order items invalid"
    );

  }

  if (
    order.items.length === 0
  ) {

    throw new Error(
      "Order items empty"
    );

  }

  return true;

}

module.exports = {

  validateOrderPayload,

};