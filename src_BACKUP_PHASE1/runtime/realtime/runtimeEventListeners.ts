import {
  subscribeRuntimeEvent,
} from "./runtimeEventBus";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  RUNTIME_CHANNELS,
} from "./runtimeChannels";

export function initializeRuntimeEventListeners() {

  /**
   * ===================================================
   * SYSTEM
   * ===================================================
   */

  subscribeRuntimeEvent(

    RUNTIME_CHANNELS.SYSTEM,

    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[SYSTEM EVENT]",
        payload
      );

    }

  );

  /**
   * ===================================================
   * PAYMENT
   * ===================================================
   */

  subscribeRuntimeEvent(

    RUNTIME_CHANNELS.PAYMENT,

    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[PAYMENT EVENT]",
        payload
      );

    }

  );

  /**
   * ===================================================
   * LOYALTY
   * ===================================================
   */

  subscribeRuntimeEvent(

    RUNTIME_CHANNELS.LOYALTY,

    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[LOYALTY EVENT]",
        payload
      );

    }

  );

}