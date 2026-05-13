import {
  useQuery,
} from "@tanstack/react-query";

/**
 * ============================================
 * HTTP QUERY FACTORY
 * ============================================
 */

function useHttpQuery({
  queryKey,

  queryFn,

  enabled = true,

  staleTime =
    1000 * 30,
}) {
  return useQuery({
    queryKey,

    queryFn,

    enabled,

    staleTime,

    retry: 1,

    refetchOnReconnect:
      true,

    refetchOnWindowFocus:
      false,
  });
}

export default useHttpQuery;