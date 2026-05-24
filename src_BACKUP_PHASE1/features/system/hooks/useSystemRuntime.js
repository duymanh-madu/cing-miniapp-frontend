import {
  useSystemBootstrapQuery,
} from "@/infra/api/system/systemQueries";

export function useSystemRuntime() {
  const query =
    useSystemBootstrapQuery();

  return {
    runtime:
      query.data || null,

    isLoading:
      query.isLoading,

    error:
      query.error,
  };
}