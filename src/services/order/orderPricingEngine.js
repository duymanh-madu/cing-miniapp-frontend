/**
 * =====================================================
 * ORDER PRICING ENGINE
 * =====================================================
 */

function calculateOrderPricing({

  items,

  shippingFee = 0,

  discount = 0,

}) {

  const subtotal =
    items.reduce(

      (
        total,
        item
      ) =>

        total +
        item.price *
        item.quantity,

      0

    );

  const total =

    subtotal +

    shippingFee -

    discount;

  return {

    subtotal,

    shippingFee,

    discount,

    total,

  };

}

module.exports = {

  calculateOrderPricing,

};