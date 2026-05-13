import {
  useIsFetching,
  useIsMutating,
} from "@tanstack/react-query";

/**
 * ============================================
 * USE API STATUS
 * ============================================
 */

function useApiStatus() {
  const fetching =
    useIsFetching();

  const mutating =
    useIsMutating();

  return {
    fetching,

    mutating,

    active:
      fetching > 0 ||
      mutating > 0,
  };
}

export default useApiStatus;