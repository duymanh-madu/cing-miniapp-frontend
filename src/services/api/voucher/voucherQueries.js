import {
  useQuery,
} from "@tanstack/react-query";

import {
  VOUCHER_QUERY_KEYS,
} from "./voucherQueryKeys";

import {
  fetchMemberVouchers,
} from "./voucherService";

import {
  createQueryOptions,
} from "@/services/query/createQueryOptions";

export function useMemberVouchersQuery(
  userId
) {
  return useQuery(
    createQueryOptions({
      queryKey:
        VOUCHER_QUERY_KEYS.MEMBER(
          userId
        ),

      queryFn:
        () =>
          fetchMemberVouchers(
            userId
          ),

      enabled:
        Boolean(userId),

      policy:
        "standard",
    })
  );
}