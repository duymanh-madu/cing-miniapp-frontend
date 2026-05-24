/**
 * =====================================================
 * ORDER ANALYTICS ENGINE
 * =====================================================
 */

const analytics = {

  totalOrders:
    0,

  completedOrders:
    0,

  cancelledOrders:
    0,

  revenue:
    0,

};

function trackOrderCreated() {

  analytics.totalOrders +=
    1;

}

function trackOrderCompleted({

  total,

}) {

  analytics.completedOrders +=
    1;

  analytics.revenue +=
    total;

}

function trackOrderCancelled() {

  analytics.cancelledOrders +=
    1;

}

function getOrderAnalytics() {

  return analytics;

}

module.exports = {

  trackOrderCreated,

  trackOrderCompleted,

  trackOrderCancelled,

  getOrderAnalytics,

};