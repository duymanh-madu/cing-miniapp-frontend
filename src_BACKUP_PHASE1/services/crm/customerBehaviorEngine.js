/**
 * =====================================================
 * CUSTOMER BEHAVIOR ENGINE
 * =====================================================
 */

function analyzeCustomerBehavior({

  totalGames,

  totalOrders,

  averageOrderValue,

}) {

  return {

    gamer:
      totalGames >= 20,

    highSpender:
      averageOrderValue >= 150000,

    loyalBuyer:
      totalOrders >= 15,

  };

}

module.exports = {

  analyzeCustomerBehavior,

};