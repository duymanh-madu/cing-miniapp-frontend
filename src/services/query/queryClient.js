import {
  QueryClient,
} from "@tanstack/react-query";

/**
 * =========================================================
 * QUERY CLIENT
 * =========================================================
 */

const queryClient =
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,

        staleTime: 1000 * 30,

        refetchOnWindowFocus:
          false,

        refetchOnReconnect:
          true,

        networkMode:
          "online",
      },

      mutations: {
        retry: 1,

        networkMode:
          "online",
      },
    },
  });

export default queryClient;