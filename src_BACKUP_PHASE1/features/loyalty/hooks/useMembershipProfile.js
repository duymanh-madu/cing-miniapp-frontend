import {
  useMembershipQuery,
} from "@/infra/api/loyalty/loyaltyQueries";

export function useMembershipProfile(
  userId
) {
  const query =
    useMembershipQuery(
      userId
    );

  return {
    membership:
      query.data || null,

    isLoading:
      query.isLoading,

    error:
      query.error,
  };
}