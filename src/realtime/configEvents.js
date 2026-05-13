import {
  useSocket,
}
from "@/providers/SocketProvider";

import useConfigStore from "../stores/configStore";

/**
 * ============================================
 * CONFIG REALTIME EVENTS
 * ============================================
 */

export function initializeConfigRealtime() {
  /**
   * FULL CONFIG UPDATE
   */

  socket.on(
    "config_updated",
    (payload) => {
      useConfigStore
        .getState()
        .setConfig(
          payload
        );
    }
  );

  /**
   * FEATURE FLAG UPDATE
   */

  socket.on(
    "feature_flag_updated",
    (payload) => {
      useConfigStore
        .getState()
        .updateFeatureFlag(
          payload
        );
    }
  );
}

/**
 * ============================================
 * DESTROY CONFIG EVENTS
 * ============================================
 */

export function destroyConfigRealtime() {
  socket.off(
    "config_updated"
  );

  socket.off(
    "feature_flag_updated"
  );
}