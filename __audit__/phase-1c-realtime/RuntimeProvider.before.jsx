import {
  useEffect,
} from "react";

import useSystemRuntime from "@/runtime/hooks/useRuntimeBootstrap";

import queryRealtimeSync from "@/services/query/queryRealtimeSync";

import offlineSyncService from "@/services/offline/offlineSyncService";

/**
 * =========================================================
 * RUNTIME PROVIDER
 * =========================================================
 */

function RuntimeProvider({
  children,
}) {
  useSystemRuntime();

  useEffect(() => {
    queryRealtimeSync.register();

    offlineSyncService.init();
  }, []);

  return children;
}

export default RuntimeProvider;