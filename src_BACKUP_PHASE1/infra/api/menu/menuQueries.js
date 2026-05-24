import {
  useQuery,
} from "@tanstack/react-query";

import {
  MENU_QUERY_KEYS,
} from "./menuQueryKeys";

import {
  fetchMenuItems,
} from "./menuService";

import {
  createQueryOptions,
} from "@/services/query/createQueryOptions";

export function useMenuQuery() {
  return useQuery(
    createQueryOptions({
      queryKey:
        MENU_QUERY_KEYS.ITEMS,

      queryFn:
        fetchMenuItems,

      policy:
        "realtime",
    })
  );
}