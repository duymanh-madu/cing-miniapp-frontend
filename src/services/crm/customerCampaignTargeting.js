/**
 * =====================================================
 * CUSTOMER CAMPAIGN TARGETING
 * =====================================================
 */

function isEligibleForCampaign({

  segment,

  loyaltyTier,

}) {

  if (
    loyaltyTier ===
    "platinum"
  ) {

    return true;

  }

  return [

    "active",

    "vip",

  ].includes(segment);

}

module.exports = {

  isEligibleForCampaign,

};