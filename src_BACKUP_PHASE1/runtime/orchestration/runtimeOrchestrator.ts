import {

  getRuntimeSocket,

  registerSocketListener,

} from "../socket/runtimeSocketClient";

import {

  updatePersonalizationState,

} from "../personalization/runtimePersonalizationEngine";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {


  pushRuntimeMessage,

} from "../communication/runtimeCommunicationEngine";

/**
 * =====================================================
 * INITIALIZE ORCHESTRATOR
 * =====================================================
 */

let initialized =
  false;

const unsubscribers:
  Array<() => void> =
  [];

export function initializeRuntimeOrchestrator() {

  if (
    initialized
  ) {

    return;

  }

  const socket =
    getRuntimeSocket();

  if (!socket) {

    return;

  }

  unsubscribers.push(

    registerSocketListener(

      "personalization:update",

      (
        payload
      ) => {

        updatePersonalizationState(
          payload
        );

      }

    )

  );

  unsubscribers.push(

    registerSocketListener(

      "communication:new",

      (
        payload
      ) => {

        pushRuntimeMessage(
          payload
        );

      }

    )

  );

  unsubscribers.push(

    registerSocketListener(

      "cms:update",

      (
        payload
      ) => {

        runtimeLogger.info("RUNTIME", 
          "[CMS] Runtime updated",
          payload
        );

      }

    )

  );

  initialized =
    true;

  runtimeLogger.info("RUNTIME", 
    "[RUNTIME] Orchestrator initialized"
  );

}

export function destroyRuntimeOrchestrator() {

  unsubscribers.forEach(
    (
      unsubscribe
    ) => {

      unsubscribe();

    }
  );

  unsubscribers.length =
    0;

  initialized =
    false;

}