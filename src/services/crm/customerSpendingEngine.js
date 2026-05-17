/**
 * =====================================================
 * CUSTOMER SPENDING ENGINE
 * =====================================================
 */

function calculateAverageOrderValue({

  totalSpent,

  totalOrders,

}) {

  if (
    totalOrders === 0
  ) {

    return 0;

  }

  return Math.floor(

    totalSpent /

    totalOrders

  );

}

module.exports = {

  calculateAverageOrderValue,

};