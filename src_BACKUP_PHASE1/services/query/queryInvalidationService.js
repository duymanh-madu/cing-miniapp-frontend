import queryClient from "@/services/query/queryClient";

/**
 * =========================================================
 * QUERY INVALIDATION SERVICE
 * =========================================================
 */

class QueryInvalidationService {
  invalidate(queryKey) {
    if (!queryKey) {
      return;
    }

    queryClient.invalidateQueries({
      queryKey,
    });
  }

  invalidateMany(queryKeys = []) {
    queryKeys.forEach((queryKey) => {
      this.invalidate(queryKey);
    });
  }

  clear() {
    queryClient.clear();
  }
}

const queryInvalidationService =
  new QueryInvalidationService();

export default
  queryInvalidationService;