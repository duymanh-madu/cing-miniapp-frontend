import {
  useQuery,
} from "@tanstack/react-query";

import {
  LOYALTY_QUERY_KEYS,
} from "./loyaltyQueryKeys";

import {
  fetchMembership,
  fetchTransactions,
} from "./loyaltyService";

import {
  createQueryOptions,
} from "@/services/query/createQueryOptions";

export function useMembershipQuery(
  userId
) {
  return useQuery(
    createQueryOptions({
      queryKey:
        LOYALTY_QUERY_KEYS.MEMBERSHIP(
          userId
        ),

      queryFn:
        () =>
          fetchMembership(
            userId
          ),

      enabled:
        Boolean(userId),

      policy:
        "standard",
    })
  );
}

export function useTransactionsQuery(
  userId
) {
  return useQuery(
    createQueryOptions({
      queryKey:
        LOYALTY_QUERY_KEYS.TRANSACTIONS(
          userId
        ),

      queryFn:
        () =>
          fetchTransactions(
            userId
          ),

      enabled:
        Boolean(userId),

      policy:
        "standard",
    })
  );
}