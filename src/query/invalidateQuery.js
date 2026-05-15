import queryClient from "./queryClient";

export async function invalidateQuery(
  queryKey
) {

  return queryClient.invalidateQueries({

    queryKey,

  });

}