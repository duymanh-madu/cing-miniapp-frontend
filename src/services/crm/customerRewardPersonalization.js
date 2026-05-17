/**
 * =====================================================
 * CUSTOMER REWARD PERSONALIZATION
 * =====================================================
 */

function personalizeReward({

  segment,

}) {

  switch (segment) {

    case "vip":

      return {

        voucher:
          100000,

      };

    case "active":

      return {

        voucher:
          50000,

      };

    default:

      return {

        voucher:
          20000,

      };

  }

}

module.exports = {

  personalizeReward,

};