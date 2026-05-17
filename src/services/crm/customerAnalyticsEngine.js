/**
 * =====================================================
 * CUSTOMER ANALYTICS ENGINE
 * =====================================================
 */

const analytics = {

  totalCustomers:
    0,

  vipCustomers:
    0,

  churnRisk:
    0,

};

function trackCustomerCreated() {

  analytics.totalCustomers +=
    1;

}

function trackVIPCustomer() {

  analytics.vipCustomers +=
    1;

}

function trackChurnRisk() {

  analytics.churnRisk +=
    1;

}

function getCustomerAnalytics() {

  return analytics;

}

module.exports = {

  trackCustomerCreated,

  trackVIPCustomer,

  trackChurnRisk,

  getCustomerAnalytics,

};