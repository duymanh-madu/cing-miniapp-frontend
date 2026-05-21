import {
  CRM_MEMBER_TIERS,
} from "./runtimeCrmConstants";

export function resolveCrmMemberTier(
  totalSpent: number
) {

  if (
    totalSpent >=
    10000000
  ) {

    return CRM_MEMBER_TIERS
      .DIAMOND;

  }

  if (
    totalSpent >=
    5000000
  ) {

    return CRM_MEMBER_TIERS
      .GOLD;

  }

  if (
    totalSpent >=
    3000000
  ) {

    return CRM_MEMBER_TIERS
      .SILVER;

  }

  if (
    totalSpent >=
    1000000
  ) {

    return CRM_MEMBER_TIERS
      .LOYAL_MEMBER;

  }

  return CRM_MEMBER_TIERS
    .MEMBER;

}