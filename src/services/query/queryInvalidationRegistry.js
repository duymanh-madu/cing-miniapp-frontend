import {
  MENU_QUERY_KEYS,
} from "@/infra/api/menu/menuQueryKeys";

import {
  VOUCHER_QUERY_KEYS,
} from "@/infra/api/voucher/voucherQueryKeys";

import {
  CAMPAIGN_QUERY_KEYS,
} from "@/infra/api/campaign/campaignQueryKeys";

import {
  LOYALTY_QUERY_KEYS,
} from "@/infra/api/loyalty/loyaltyQueryKeys";

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