import {
  subscribeRuntimeEvent,
} from "./runtimeEventBus";

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

      console.log(
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

      console.log(
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

      console.log(
        "[LOYALTY EVENT]",
        payload
      );

    }

  );

}