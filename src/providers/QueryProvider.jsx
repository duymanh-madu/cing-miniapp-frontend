import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

/**
 * ============================================
 * QUERY CLIENT
 * ============================================
 */

export const queryClient =
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,

        staleTime:
          1000 * 30,

        refetchOnReconnect:
          true,

        refetchOnWindowFocus:
          false,
      },
    },
  });

/**
 * ============================================
 * QUERY PROVIDER
 * ============================================
 */

function QueryProvider({
  children,
}) {
  return (
    <QueryClientProvider
      client={
        queryClient
      }
    >
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;