import {
  QueryClient,
} from "@tanstack/react-query";

const queryClient =
  new QueryClient({

    defaultOptions: {

      queries: {

        retry: 1,

        staleTime:
          1000 * 60,

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

export default
  queryClient;