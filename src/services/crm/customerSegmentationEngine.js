/**
 * =====================================================
 * CUSTOMER SEGMENTATION ENGINE
 * =====================================================
 */

const CUSTOMER_SEGMENTS = {

  NEW:
    "new",

  CASUAL:
    "casual",

  ACTIVE:
    "active",

  VIP:
    "vip",

};

function detectCustomerSegment({

  totalSpent,

  totalOrders,

}) {

  if (
    totalSpent >= 5000000
  ) {

    return CUSTOMER_SEGMENTS.VIP;

  }

  if (
    totalOrders >= 20
  ) {

    return CUSTOMER_SEGMENTS.ACTIVE;

  }

  if (
    totalOrders >= 5
  ) {

    return CUSTOMER_SEGMENTS.CASUAL;

  }

  return CUSTOMER_SEGMENTS.NEW;

}

module.exports = {

  CUSTOMER_SEGMENTS,

  detectCustomerSegment,

};