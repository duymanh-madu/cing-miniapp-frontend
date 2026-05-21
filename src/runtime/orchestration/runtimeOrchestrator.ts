import {

  getRuntimeSocket,

} from "../socket/runtimeSocketClient";

import {

  updatePersonalizationState,

} from "../personalization/runtimePersonalizationEngine";

import {

  pushRuntimeMessage,

} from "../communication/runtimeCommunicationEngine";

/**
 * =====================================================
 * INITIALIZE ORCHESTRATOR
 * =====================================================
 */

export function initializeRuntimeOrchestrator() {

  const socket =
    getRuntimeSocket();

  if (!socket) {

    return;

  }

  /**
   * ===================================================
   * PERSONALIZATION
   * ===================================================
   */

  socket.on(
    "personalization:update",
    (
      payload
    ) => {

      updatePersonalizationState(
        payload
      );

    }
  );

  /**
   * ===================================================
   * COMMUNICATION
   * ===================================================
   */

  socket.on(
    "communication:new",
    (
      payload
    ) => {

      pushRuntimeMessage(
        payload
      );

    }
  );

  /**
   * ===================================================
   * CMS
   * ===================================================
   */

  socket.on(
    "cms:update",
    (
      payload
    ) => {

      console.log(
        "[CMS] Runtime updated",
        payload
      );

    }
  );

  console.log(
    "[RUNTIME] Orchestrator initialized"
  );

}