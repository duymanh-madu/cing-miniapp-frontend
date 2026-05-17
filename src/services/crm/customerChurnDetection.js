/**
 * =====================================================
 * CUSTOMER CHURN DETECTION
 * =====================================================
 */

function detectCustomerChurn({

  daysInactive,

  totalOrders,

}) {

  return (

    daysInactive >= 45 &&

    totalOrders >= 3

  );

}

module.exports = {

  detectCustomerChurn,

};