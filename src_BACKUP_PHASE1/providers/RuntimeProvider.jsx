import {
  useEffect,
} from "react";

import queryRealtimeSync from "@/services/query/queryRealtimeSync";

import offlineSyncService from "@/services/offline/offlineSyncService";

/**
 * =====================================================
 * RUNTIME PROVIDER
 * =====================================================
 * Production governance:
 * - Runtime bootstrap ownership belongs to AppBootstrapGate.
 * - This provider must not call bootstrapRuntime directly.
 * - Query realtime sync and offline sync are provider-level
 *   support services and must initialize once only.
 * =====================================================
 */

let supportServicesInitialized =
  false;

function RuntimeProvider({
  children,
}) {

  useEffect(() => {

    if (
      supportServicesInitialized
    ) {

      return;

    }

    supportServicesInitialized =
      true;

    queryRealtimeSync.register();

    offlineSyncService.init();

  }, []);

  return children;

}

export default RuntimeProvider;
