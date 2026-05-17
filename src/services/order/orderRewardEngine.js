const {

  calculateXP,

} = require(
  "../gamification/xpEngine"
);

/**
 * =====================================================
 * ORDER REWARD ENGINE
 * =====================================================
 */

function calculateOrderRewards({

  total,

}) {

  const earnedXP =
    calculateXP({

      action:
        "ORDER_COMPLETED",

      multiplier:
        Math.max(
          1,
          total / 100000
        ),

    });

  return {

    earnedXP,

  };

}

module.exports = {

  calculateOrderRewards,

};