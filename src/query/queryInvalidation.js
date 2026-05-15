import {
  queryClient,
} from "./queryClient";

export function invalidateQuery(
  queryKey
) {
  return queryClient.invalidateQueries(
    {
      queryKey,
    }
  );
}