import {
  invalidateDomainQueries,
} from "@/services/query/queryInvalidationRegistry";

export function registerRealtimeInvalidation({
  queryClient,
  domain,
}) {
  if (
    !queryClient ||
    !domain
  ) {
    return;
  }

  invalidateDomainQueries({
    queryClient,
    domain,
  });
}