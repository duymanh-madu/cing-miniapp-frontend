/**
 * =====================================================
 * CUSTOMER LOYALTY ENGINE
 * =====================================================
 */

const LOYALTY_TIERS = {

  BRONZE:
    "bronze",

  SILVER:
    "silver",

  GOLD:
    "gold",

  PLATINUM:
    "platinum",

};

function calculateLoyaltyTier({

  totalSpent,

}) {

  if (
    totalSpent >= 10000000
  ) {

    return LOYALTY_TIERS.PLATINUM;

  }

  if (
    totalSpent >= 5000000
  ) {

    return LOYALTY_TIERS.GOLD;

  }

  if (
    totalSpent >= 1000000
  ) {

    return LOYALTY_TIERS.SILVER;

  }

  return LOYALTY_TIERS.BRONZE;

}

module.exports = {

  LOYALTY_TIERS,

  calculateLoyaltyTier,

};