export interface MembershipCardRuntime {

  customerId:
    string;

  tier:
    string;

  totalSpent:
    number;

  loyaltyPoints:
    number;

  nextTier?:
    string;

  remainingToNextTier?:
    number;

  progressPercentage?:
    number;

}