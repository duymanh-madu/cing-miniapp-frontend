export const QUERY_POLICIES =
  Object.freeze({
    realtime: {
      staleTime:
        1000 * 15,

      gcTime:
        1000 * 60 * 30,

      retry: 2,

      refetchOnReconnect:
        true,

      refetchOnWindowFocus:
        false,

      networkMode:
        "online",
    },

    standard: {
      staleTime:
        1000 * 60,

      gcTime:
        1000 * 60 * 60,

      retry: 2,

      refetchOnReconnect:
        true,

      refetchOnWindowFocus:
        false,

      networkMode:
        "online",
    },

    static: {
      staleTime:
        Infinity,

      gcTime:
        Infinity,

      retry: 1,

      refetchOnReconnect:
        false,

      refetchOnWindowFocus:
        false,

      networkMode:
        "online",
    },

    infinite: {
      staleTime:
        1000 * 30,

      gcTime:
        1000 * 60 * 60,

      retry: 2,

      refetchOnReconnect:
        true,

      refetchOnWindowFocus:
        false,

      networkMode:
        "online",
    },
  });

export function resolveQueryPolicy(
  type = "standard"
) {
  return (
    QUERY_POLICIES[
      type
    ] ||
    QUERY_POLICIES.standard
  );
}