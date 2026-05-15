import {
  queryClient,
} from "./queryClient";

export function getQueryData(
  queryKey
) {
  return queryClient.getQueryData(
    queryKey
  );
}