/**
 * =====================================================
 * CUSTOMER PROFILE ENGINE
 * =====================================================
 */

function buildCustomerProfile({

  customerId,

  name,

  totalSpent = 0,

  totalOrders = 0,

  totalGames = 0,

  joinedAt,

}) {

  return {

    customerId,

    name,

    totalSpent,

    totalOrders,

    totalGames,

    joinedAt,

    updatedAt:
      new Date().toISOString(),

  };

}

module.exports = {

  buildCustomerProfile,

};