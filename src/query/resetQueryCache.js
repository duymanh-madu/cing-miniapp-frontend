import queryClient from "./queryClient";

export function resetQueryCache() {

  queryClient.clear();

}