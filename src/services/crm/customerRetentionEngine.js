/**
 * =====================================================
 * CUSTOMER RETENTION ENGINE
 * =====================================================
 */

function calculateRetentionRisk({

  daysInactive,

}) {

  if (
    daysInactive >= 30
  ) {

    return "high";

  }

  if (
    daysInactive >= 14
  ) {

    return "medium";

  }

  return "low";

}

module.exports = {

  calculateRetentionRisk,

};