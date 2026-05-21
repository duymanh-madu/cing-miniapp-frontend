import {
  MEMBERSHIP_THRESHOLDS,
} from "./runtimeMembershipCardConstants";

export function calculateNextTier(
  totalSpent:
    number,
) {

  if (
    totalSpent < MEMBERSHIP_THRESHOLDS.hoi_vien_than_thiet
  ) {

    return {
      nextTier:
        "hoi_vien_than_thiet",

      remaining:
        MEMBERSHIP_THRESHOLDS.hoi_vien_than_thiet -
        totalSpent,
    };

  }

  if (
    totalSpent < MEMBERSHIP_THRESHOLDS.hoi_vien_bac
  ) {

    return {
      nextTier:
        "hoi_vien_bac",

      remaining:
        MEMBERSHIP_THRESHOLDS.hoi_vien_bac -
        totalSpent,
    };

  }

  if (
    totalSpent < MEMBERSHIP_THRESHOLDS.hoi_vien_vang
  ) {

    return {
      nextTier:
        "hoi_vien_vang",

      remaining:
        MEMBERSHIP_THRESHOLDS.hoi_vien_vang -
        totalSpent,
    };

  }

  if (
    totalSpent < MEMBERSHIP_THRESHOLDS.hoi_vien_kim_cuong
  ) {

    return {
      nextTier:
        "hoi_vien_kim_cuong",

      remaining:
        MEMBERSHIP_THRESHOLDS.hoi_vien_kim_cuong -
        totalSpent,
    };

  }

  return {

    nextTier:
      null,

    remaining:
      0,

  };

}