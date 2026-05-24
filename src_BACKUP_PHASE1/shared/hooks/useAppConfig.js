import {
  useEffect,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import useConfigStore from "../stores/configStore";

import {
  fetchAppConfig,
} from "../services/configService";

/**
 * ============================================
 * USE APP CONFIG
 * ============================================
 */

function useAppConfig() {
  const config =
    useConfigStore(
      (state) =>
        state.config
    );

  const setConfig =
    useConfigStore(
      (state) =>
        state.setConfig
    );

  const query =
    useQuery({
      queryKey: [
        "app-config",
      ],

      queryFn:
        fetchAppConfig,

      staleTime:
        1000 * 30,
    });

  /**
   * SYNC STORE
   */

  useEffect(() => {
    if (
      query.data
    ) {
      setConfig(
        query.data
      );
    }
  }, [
    query.data,
    setConfig,
  ]);

  return {
    config,

    loading:
      query.isLoading,

    error:
      query.error,
  };
}

export default useAppConfig;