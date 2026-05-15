import {
  queryClient,
} from "./queryClient";

export function prefetchQuery({
  queryKey,
  queryFn,
}) {
  return queryClient.prefetchQuery(
    {
      queryKey,
      queryFn,
    }
  );
}