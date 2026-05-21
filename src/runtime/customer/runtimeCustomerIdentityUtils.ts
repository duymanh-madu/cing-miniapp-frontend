import {
  RuntimeMembershipTier,
} from "./runtimeCustomerIdentityTypes";

export function calculateMembershipTier(
  spending:
    number,
): RuntimeMembershipTier {

  if (
    spending >= 10000000
  ) {

    return "hoi_vien_kim_cuong";

  }

  if (
    spending >= 5000000
  ) {

    return "hoi_vien_vang";

  }

  if (
    spending >= 3000000
  ) {

    return "hoi_vien_bac";

  }

  if (
    spending >= 1000000
  ) {

    return "hoi_vien_than_thiet";

  }

  return "hoi_vien";

}