import {
  resolveQueryPolicy,
} from "./queryPolicies";

export function createInfiniteQueryOptions({
  queryKey,
  queryFn,
  policy = "standard",
  initialPageParam = 1,
  getNextPageParam,
  enabled = true,
}) {
  return {
    queryKey,

    queryFn,

    enabled,

    initialPageParam,

    getNextPageParam,

    ...resolveQueryPolicy(
      policy
    ),
  };
}