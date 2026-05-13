import {
  queryClient,
} from "../../providers/QueryProvider";

/**
 * ============================================
 * INVALIDATE QUERY
 * ============================================
 */

export async function invalidateQuery(
  queryKey
) {
  await queryClient.invalidateQueries(
    {
      queryKey,
    }
  );
}