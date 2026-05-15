import queryClient from "./queryClient";

export function removeQuery(
  queryKey
) {

  queryClient.removeQueries({

    queryKey,

  });

}