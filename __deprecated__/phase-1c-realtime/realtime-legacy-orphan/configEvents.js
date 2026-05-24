/**
 * =========================================================
 * CONFIG REALTIME STATE
 * =========================================================
 */

import useConfigStore from "../stores/configStore";

/**
 * =========================================================
 * INITIALIZED
 * =========================================================
 */

let initialized =
  false;

/**
 * =========================================================
 * HANDLERS
 * =========================================================
 */

let handleConfigUpdated;

let handleFeatureFlagUpdated;

/**
 * =========================================================
 * INITIALIZE CONFIG REALTIME
 * =========================================================
 */

export function
initializeConfigRealtime(
  socket
) {

  /**
   * =======================================================
   * SOCKET REQUIRED
   * =======================================================
   */

  if (
    !socket
  ) {

    return;

  }

  /**
   * =======================================================
   * PREVENT DUPLICATE
   * =======================================================
   */

  if (
    initialized
  ) {

    return;

  }

  initialized =
    true;

  /**
   * =======================================================
   * CONFIG UPDATED
   * =======================================================
   */

  handleConfigUpdated =
    (payload) => {

      /**
       * ===================================================
       * VALIDATE
       * ===================================================
       */

      if (
        !payload
      ) {

        return;

      }

      console.log(
        "⚙️ CONFIG UPDATED",
        payload
      );

      /**
       * ===================================================
       * UPDATE STORE
       * ===================================================
       */

      useConfigStore
        .getState()
        .setConfig(
          payload
        );

    };

  /**
   * =======================================================
   * FEATURE FLAG UPDATED
   * =======================================================
   */

  handleFeatureFlagUpdated =
    (payload) => {

      /**
       * ===================================================
       * VALIDATE
       * ===================================================
       */

      if (
        !payload
      ) {

        return;

      }

      console.log(
        "🚩 FEATURE FLAG UPDATED",
        payload
      );

      /**
       * ===================================================
       * UPDATE STORE
       * ===================================================
       */

      useConfigStore
        .getState()
        .updateFeatureFlag(
          payload
        );

    };

  /**
   * =======================================================
   * REGISTER EVENTS
   * =======================================================
   */

  socket.on(
    "config_updated",
    handleConfigUpdated
  );

  socket.on(
    "feature_flag_updated",
    handleFeatureFlagUpdated
  );

  console.log(
    "🟢 CONFIG REALTIME INITIALIZED"
  );

}

/**
 * =========================================================
 * DESTROY CONFIG REALTIME
 * =========================================================
 */

export function
destroyConfigRealtime(
  socket
) {

  /**
   * =======================================================
   * SOCKET REQUIRED
   * =======================================================
   */

  if (
    !socket
  ) {

    return;

  }

  /**
   * =======================================================
   * RESET
   * =======================================================
   */

  initialized =
    false;

  /**
   * =======================================================
   * REMOVE LISTENERS
   * =======================================================
   */

  socket.off(
    "config_updated",
    handleConfigUpdated
  );

  socket.off(
    "feature_flag_updated",
    handleFeatureFlagUpdated
  );

  console.log(
    "🔴 CONFIG REALTIME DESTROYED"
  );

}