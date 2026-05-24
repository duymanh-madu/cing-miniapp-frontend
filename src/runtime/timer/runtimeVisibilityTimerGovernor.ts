/**
 * =====================================================
 * RUNTIME VISIBILITY TIMER GOVERNOR
 * =====================================================
 * ENTERPRISE TIMER GOVERNANCE
 * ZALO WEBVIEW SAFE
 * MOBILE MEMORY SAFE
 * BACKGROUND SAFE
 * =====================================================
 */

import runtimeTimerRegistry from "./runtimeTimerRegistry";
import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";


/**
 * =====================================================
 * VISIBILITY TIMER GOVERNOR
 * =====================================================
 */

class RuntimeVisibilityTimerGovernor {

  /**
   * ===================================================
   * STATE
   * ===================================================
   */

  private initialized =
    false;

  /**
   * ===================================================
   * VISIBILITY HANDLER
   * ===================================================
   */

  private handleVisibilityChange =
    () => {

      /**
       * ===============================================
       * HIDDEN
       * ===============================================
       */

      if (
        document.visibilityState !==
        "visible"
      ) {

        runtimeLogger.info("RUNTIME", 
          "[TIMER GOVERNOR] APP HIDDEN"
        );

        return;

      }

      /**
       * ===============================================
       * RESUMED
       * ===============================================
       */

      runtimeLogger.info("RUNTIME", 
        "[TIMER GOVERNOR] APP RESUMED"
      );

    };

  /**
   * ===================================================
   * WINDOW FOCUS
   * ===================================================
   */

  private handleFocus =
    () => {

      runtimeLogger.info("RUNTIME", 
        "[TIMER GOVERNOR] WINDOW FOCUSED"
      );

    };

  /**
   * ===================================================
   * WINDOW BLUR
   * ===================================================
   */

  private handleBlur =
    () => {

      runtimeLogger.info("RUNTIME", 
        "[TIMER GOVERNOR] WINDOW BLURRED"
      );

    };

  /**
   * ===================================================
   * INITIALIZE
   * ===================================================
   */

  initialize() {

    /**
     * ===============================================
     * SINGLETON PROTECTION
     * ===============================================
     */

    if (
      this.initialized
    ) {

      return;

    }

    /**
     * ===============================================
     * VISIBILITY
     * ===============================================
     */

    document.addEventListener(

      "visibilitychange",

      this.handleVisibilityChange

    );

    /**
     * ===============================================
     * WINDOW FOCUS
     * ===============================================
     */

    window.addEventListener(

      "focus",

      this.handleFocus

    );

    /**
     * ===============================================
     * WINDOW BLUR
     * ===============================================
     */

    window.addEventListener(

      "blur",

      this.handleBlur

    );

    /**
     * ===============================================
     * READY
     * ===============================================
     */

    this.initialized =
      true;

    runtimeLogger.info("RUNTIME", 
      "[TIMER GOVERNOR] INITIALIZED"
    );

  }

  /**
   * ===================================================
   * METRICS
   * ===================================================
   */

  getMetrics() {

    return {

      initialized:
        this.initialized,

      visibility:
        document.visibilityState,

      timers:
        runtimeTimerRegistry
          .getMetrics(),

    };

  }

  /**
   * ===================================================
   * DESTROY
   * ===================================================
   */

  destroy() {

    /**
     * ===============================================
     * REMOVE EVENTS
     * ===============================================
     */

    document.removeEventListener(

      "visibilitychange",

      this.handleVisibilityChange

    );

    window.removeEventListener(

      "focus",

      this.handleFocus

    );

    window.removeEventListener(

      "blur",

      this.handleBlur

    );

    /**
     * ===============================================
     * RESET
     * ===============================================
     */

    this.initialized =
      false;

    runtimeLogger.info("RUNTIME", 
      "[TIMER GOVERNOR] DESTROYED"
    );

  }

}

/**
 * =====================================================
 * SINGLETON
 * =====================================================
 */

export const runtimeVisibilityTimerGovernor =
  new RuntimeVisibilityTimerGovernor();

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

export default
  runtimeVisibilityTimerGovernor;