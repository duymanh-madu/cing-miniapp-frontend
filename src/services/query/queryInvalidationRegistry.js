import {
  MENU_QUERY_KEYS,
} from "@/services/api/menu/menuQueryKeys";

import {
  VOUCHER_QUERY_KEYS,
} from "@/services/api/voucher/voucherQueryKeys";

import {
  CAMPAIGN_QUERY_KEYS,
} from "@/services/api/campaign/campaignQueryKeys";

import {
  LOYALTY_QUERY_KEYS,
} from "@/services/api/loyalty/loyaltyQueryKeys";

export const QUERY_INVALIDATION_REGISTRY =
  Object.freeze({
    menu: [
      MENU_QUERY_KEYS.ITEMS,
      MENU_QUERY_KEYS.FEATURED,
    ],

    voucher: [
      VOUCHER_QUERY_KEYS.ALL,
    ],

    campaign: [
      CAMPAIGN_QUERY_KEYS.ALL,
    ],

    loyalty: [
      LOYALTY_QUERY_KEYS.ALL,
    ],
  });

export function invalidateDomainQueries({
  queryClient,
  domain,
}) {
  const keys =
    QUERY_INVALIDATION_REGISTRY[
      domain
    ] || [];

  keys.forEach(
    (queryKey) => {
      queryClient.invalidateQueries({
        queryKey,
      });
    }
  );
}