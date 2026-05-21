import {
  calculateLoyaltyPoints,
} from "./runtimeCrmSpendAggregationEngine";

import {
  resolveCrmMemberTier,
} from "./runtimeCrmGovernanceEngine";

export function mapCrmCustomer(
  payload: any
) {

  const totalSpent =
    payload.totalSpent || 0;

  return {

    customerId:
      payload.customerId,

    phone:
      payload.phone,

    fullName:
      payload.fullName,

    totalSpent,

    loyaltyPoints:
      calculateLoyaltyPoints(
        totalSpent
      ),

    memberTier:
      resolveCrmMemberTier(
        totalSpent
      ),

    partnerTier:
      payload.partnerTier ||
      null,

    monthlySpent:
      payload.monthlySpent ||
      0,

    oaFollowed:
      payload.oaFollowed ||
      false,

    activated:
      payload.activated ||
      false,

  };

}