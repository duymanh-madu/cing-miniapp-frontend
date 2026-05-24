import {
  calculateLoyaltyPoints,
} from "./runtimeCrmSpendAggregationEngine";

import {
  resolveCrmMemberTier,
} from "./runtimeCrmGovernanceEngine";

/**
 * =====================================================
 * CRM CANONICAL MAPPING ENGINE
 * =====================================================
 * iPOS CRM
 * → Runtime canonical customer
 * =====================================================
 */

export function mapCrmCustomer(
  payload: any
) {

  /**
   * ===================================================
   * SPENDING
   * ===================================================
   */

  const totalSpent =
    Number(

      payload.totalSpent ||

      payload.membership_payment_amount ||

      payload.membershipPaymentAmount ||

      0
    );

  /**
   * ===================================================
   * LOYALTY
   * ===================================================
   */

  const loyaltyPoints =
    Number(

      payload.loyaltyPoints ||

      payload.membership_point ||

      payload.membershipPoint ||

      calculateLoyaltyPoints(
        totalSpent
      )
    );

  /**
   * ===================================================
   * MEMBER TIER
   * ===================================================
   */

  const memberTier =

    payload.memberTier ||

    payload.membership_type ||

    payload.membershipType ||

    resolveCrmMemberTier(
      totalSpent
    );

  return {

    /**
     * ================================================
     * IDENTITY
     * ================================================
     */

    customerId:

      payload.customerId ||

      payload.customer_id ||

      payload.user_id ||

      "",

    phone:

      payload.phone ||

      payload.customer_phone ||

      "",

    fullName:

      payload.fullName ||

      payload.customer_name ||

      "",

    /**
     * ================================================
     * MEMBERSHIP
     * ================================================
     */

    memberTier,

    membershipType:

      payload.membership_type ||

      payload.membershipType ||

      memberTier,

    partnerTier:

      payload.partnerTier ||
      null,

    /**
     * ================================================
     * SPENDING
     * ================================================
     */

    totalSpent,

    monthlySpent:

      Number(
        payload.monthlySpent ||
        0
      ),

    /**
     * ================================================
     * LOYALTY
     * ================================================
     */

    loyaltyPoints,

    loyaltyPointAmount:

      Number(

        payload.loyalty_point_amount ||

        payload.membership_point_amount ||

        payload.membershipPointAmount ||

        0
      ),

    membershipPoint:

      Number(

        payload.membership_point ||

        payload.membershipPoint ||

        loyaltyPoints
      ),

    membershipPointAmount:

      Number(

        payload.membership_point_amount ||

        payload.membershipPointAmount ||

        0
      ),

    membershipPaymentAmount:
      totalSpent,

    /**
     * ================================================
     * CUSTOMER LIFECYCLE
     * ================================================
     */

    visitCount:

      Number(

        payload.visit_times ||

        payload.visitCount ||

        0
      ),

    firstVisitAt:

      payload.first_visit ||
      payload.firstVisitAt ||
      null,

    lastVisitAt:

      payload.last_visit ||
      payload.lastVisitAt ||
      null,

    birthday:

      payload.birthday ||
      null,

    birthMonth:

      payload.birth_month ||
      null,

    /**
     * ================================================
     * SOCIAL CONNECTION
     * ================================================
     */

    zaloJoinedAt:

      payload.zalo_join_at ||
      null,

    facebookJoinedAt:

      payload.facebook_join_at ||
      null,

    oaFollowed:

      payload.oaFollowed ||
      false,

    /**
     * ================================================
     * ACTIVATION
     * ================================================
     */

    activated:

      payload.activated ||
      false,

  };

}
