import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * ============================================
 * HTTP MUTATION FACTORY
 * ============================================
 */

function useHttpMutation({
  mutationFn,

  invalidate = [],
}) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess:
      async () => {
        await Promise.all(
          invalidate.map(
            (
              key
            ) =>
              queryClient.invalidateQueries(
                {
                  queryKey:
                    key,
                }
              )
          )
        );
      },
  });
}

export default useHttpMutation;