/**
 * =====================================================
 * RUNTIME SAFE INTERVAL
 * =====================================================
 * ENTERPRISE TIMER GOVERNANCE
 * ZALO WEBVIEW SAFE
 * MOBILE MEMORY SAFE
 * VISIBILITY AWARE
 * =====================================================
 */

import runtimeTimerRegistry from "./runtimeTimerRegistry";
import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";


/**
 * =====================================================
 * TYPES
 * =====================================================
 */

export interface RuntimeSafeIntervalOptions {

  id:
    string;

  callback:
    () => void;

  interval:
    number;

  immediate?:
    boolean;

  visibilityAware?:
    boolean;

  autoCleanup?:
    boolean;

}

/**
 * =====================================================
 * CREATE SAFE INTERVAL
 * =====================================================
 */

export function createRuntimeSafeInterval({

  id,

  callback,

  interval,

  immediate =
    false,

  visibilityAware =
    true,

  autoCleanup =
    true,

}: RuntimeSafeIntervalOptions) {

  /**
   * ===================================================
   * DUPLICATE PROTECTION
   * ===================================================
   */

  runtimeTimerRegistry
    .clearInterval(
      id
    );

  /**
   * ===================================================
   * EXECUTE
   * ===================================================
   */

  const execute =
    () => {

      /**
       * ===============================================
       * VISIBILITY GOVERNANCE
       * ===============================================
       */

      if (

        visibilityAware &&

        typeof document !==
          "undefined" &&

        document.visibilityState !==
          "visible"

      ) {

        return;

      }

      /**
       * ===============================================
       * EXECUTE CALLBACK
       * ===============================================
       */

      try {

        callback();

      } catch (
        error
      ) {

        runtimeLogger.error("RUNTIME", 

          "[SAFE INTERVAL ERROR]",

          {
            id,
            error,
          }

        );

      }

    };

  /**
   * ===================================================
   * IMMEDIATE EXECUTION
   * ===================================================
   */

  if (
    immediate
  ) {

    execute();

  }

  /**
   * ===================================================
   * CREATE INTERVAL
   * ===================================================
   */

  const timer =
    globalThis.setInterval(

      execute,

      interval

    );

  /**
   * ===================================================
   * REGISTER
   * ===================================================
   */

  runtimeTimerRegistry
    .registerInterval(

      id,

      timer,

      {

        visibilityAware,

        autoCleanup,

      }

    );

  /**
   * ===================================================
   * CLEANUP
   * ===================================================
   */

  return () => {

    runtimeTimerRegistry
      .clearInterval(
        id
      );

  };

}

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

export default
  createRuntimeSafeInterval;