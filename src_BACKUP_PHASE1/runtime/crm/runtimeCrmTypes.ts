export interface RuntimeCrmCustomer {

  /**
   * ===================================================
   * CORE IDENTITY
   * ===================================================
   */

  customerId:
    string;

  phone:
    string;

  fullName:
    string;

  /**
   * ===================================================
   * MEMBERSHIP
   * ===================================================
   */

  memberTier:
    string;

  membershipType?:
    string;

  partnerTier:
    string | null;

  /**
   * ===================================================
   * SPENDING
   * ===================================================
   */

  totalSpent:
    number;

  monthlySpent:
    number;

  /**
   * ===================================================
   * LOYALTY
   * ===================================================
   */

  loyaltyPoints:
    number;

  loyaltyPointAmount?:
    number;

  membershipPoint?:
    number;

  membershipPointAmount?:
    number;

  membershipPaymentAmount?:
    number;

  /**
   * ===================================================
   * CUSTOMER LIFECYCLE
   * ===================================================
   */

  visitCount?:
    number;

  firstVisitAt?:
    string | null;

  lastVisitAt?:
    string | null;

  birthday?:
    string | null;

  birthMonth?:
    number | null;

  /**
   * ===================================================
   * SOCIAL CONNECTION
   * ===================================================
   */

  zaloJoinedAt?:
    string | null;

  facebookJoinedAt?:
    string | null;

  oaFollowed:
    boolean;

  /**
   * ===================================================
   * ACTIVATION
   * ===================================================
   */

  activated:
    boolean;

}
