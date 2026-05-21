import {
  useQuery,
} from "@tanstack/react-query";

import {
  SYSTEM_QUERY_KEYS,
} from "./systemQueryKeys";

import {
  bootstrapSystem,
} from "./systemService";

import {
  createQueryOptions,
} from "@/services/query/createQueryOptions";

export function useSystemBootstrapQuery() {
  return useQuery(
    createQueryOptions({
      queryKey:
        SYSTEM_QUERY_KEYS.RUNTIME,

      queryFn:
        bootstrapSystem,

      policy:
        "static",
    })
  );
}