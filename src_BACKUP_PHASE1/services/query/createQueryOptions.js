import {
  resolveQueryPolicy,
} from "./queryPolicies";

export function createQueryOptions({
  queryKey,
  queryFn,
  policy = "standard",
  enabled = true,
  select,
  placeholderData,
}) {
  return {
    queryKey,

    queryFn,

    enabled,

    select,

    placeholderData,

    ...resolveQueryPolicy(
      policy
    ),
  };
}