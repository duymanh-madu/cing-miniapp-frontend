import {
  QueryClientProvider,
} from "@tanstack/react-query";

import queryClient from "@/services/query/queryClient";

/**
 * =========================================================
 * QUERY PROVIDER
 * =========================================================
 */

function QueryProvider({
  children,
}) {
  return (
    <QueryClientProvider
      client={queryClient}
    >
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;