import {
  resolveMembershipCardTheme,
} from "./runtimeMembershipCardThemeEngine";

import {
  calculateMembershipTierProgress,
} from "./runtimeMembershipTierProgressEngine";

import {
  buildMembershipBarcode,
} from "./runtimeMembershipBarcodeEngine";

import {
  buildMembershipBrandLayer,
} from "./runtimeMembershipCardBrandLayer";

export function buildMembershipCardRuntime({

  customer,

}: {

  customer: {

    fullName: string;

    phone: string;

    tier: string;

    totalSpent: number;

    loyaltyPoints: number;

  };

}) {

  const theme =
    resolveMembershipCardTheme(
      customer.tier,
    );

  const progress =
    calculateMembershipTierProgress({

      tier:
        customer.tier,

      totalSpent:
        customer.totalSpent,

    });

  const barcode =
    buildMembershipBarcode(
      customer.phone,
    );

  const brand =
    buildMembershipBrandLayer();

  return {

    customer,

    theme,

    progress,

    barcode,

    brand,

  };

}