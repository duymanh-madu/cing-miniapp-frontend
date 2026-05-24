import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * RUNTIME TIMER REGISTRY
 * =====================================================
 * ENTERPRISE TIMER GOVERNANCE
 * ZALO WEBVIEW SAFE
 * MOBILE MEMORY SAFE
 * LOW-END DEVICE SAFE
 * =====================================================
 */

export type RuntimeTimerType =
  | "interval"
  | "timeout";

export interface RuntimeTimerMetadata {

  id:
    string;

  type:
    RuntimeTimerType;

  createdAt:
    number;

  active:
    boolean;

  visibilityAware?:
    boolean;

  autoCleanup?:
    boolean;

}

/**
 * =====================================================
 * TIMER REGISTRY
 * =====================================================
 */

class RuntimeTimerRegistry {

  /**
   * ===================================================
   * STATE
   * ===================================================
   */

  private intervals =
    new Map<
      string,
      ReturnType<typeof setInterval>
    >();

  private timeouts =
    new Map<
      string,
      ReturnType<typeof setTimeout>
    >();

  private metadata =
    new Map<
      string,
      RuntimeTimerMetadata
    >();

  /**
   * ===================================================
   * REGISTER INTERVAL
   * ===================================================
   */

  registerInterval(
    id: string,
    timer:
      ReturnType<typeof setInterval>,
    options?: {

      visibilityAware?:
        boolean;

      autoCleanup?:
        boolean;

    }
  ) {

    /**
     * ===============================================
     * DUPLICATE PROTECTION
     * ===============================================
     */

    if (
      this.intervals.has(id)
    ) {

      runtimeLogger.warn("RUNTIME", 

        "[TIMER] DUPLICATE INTERVAL BLOCKED",

        id

      );

      return;

    }

    this.intervals.set(
      id,
      timer
    );

    this.metadata.set(
      id,
      {

        id,

        type:
          "interval",

        createdAt:
          Date.now(),

        active:
          true,

        visibilityAware:
          options?.visibilityAware,

        autoCleanup:
          options?.autoCleanup,

      }
    );

  }

  /**
   * ===================================================
   * REGISTER TIMEOUT
   * ===================================================
   */

  registerTimeout(
    id: string,
    timer:
      ReturnType<typeof setTimeout>,
    options?: {

      visibilityAware?:
        boolean;

      autoCleanup?:
        boolean;

    }
  ) {

    /**
     * ===============================================
     * DUPLICATE PROTECTION
     * ===============================================
     */

    if (
      this.timeouts.has(id)
    ) {

      runtimeLogger.warn("RUNTIME", 

        "[TIMER] DUPLICATE TIMEOUT BLOCKED",

        id

      );

      return;

    }

    this.timeouts.set(
      id,
      timer
    );

    this.metadata.set(
      id,
      {

        id,

        type:
          "timeout",

        createdAt:
          Date.now(),

        active:
          true,

        visibilityAware:
          options?.visibilityAware,

        autoCleanup:
          options?.autoCleanup,

      }
    );

  }

  /**
   * ===================================================
   * CLEAR INTERVAL
   * ===================================================
   */

  clearInterval(
    id: string
  ) {

    const timer =
      this.intervals.get(id);

    if (
      !timer
    ) {

      return;

    }

    globalThis.clearInterval(
      timer
    );

    this.intervals.delete(
      id
    );

    this.metadata.delete(
      id
    );

  }

  /**
   * ===================================================
   * CLEAR TIMEOUT
   * ===================================================
   */

  clearTimeout(
    id: string
  ) {

    const timer =
      this.timeouts.get(id);

    if (
      !timer
    ) {

      return;

    }

    globalThis.clearTimeout(
      timer
    );

    this.timeouts.delete(
      id
    );

    this.metadata.delete(
      id
    );

  }

  /**
   * ===================================================
   * CLEAR ALL
   * ===================================================
   */

  clearAll() {

    /**
     * ===============================================
     * INTERVALS
     * ===============================================
     */

    this.intervals.forEach(
      (
        timer
      ) => {

        globalThis.clearInterval(
          timer
        );

      }
    );

    /**
     * ===============================================
     * TIMEOUTS
     * ===============================================
     */

    this.timeouts.forEach(
      (
        timer
      ) => {

        globalThis.clearTimeout(
          timer
        );

      }
    );

    /**
     * ===============================================
     * RESET
     * ===============================================
     */

    this.intervals.clear();

    this.timeouts.clear();

    this.metadata.clear();

  }

  /**
   * ===================================================
   * GET METRICS
   * ===================================================
   */

  getMetrics() {

    return {

      intervals:
        this.intervals.size,

      timeouts:
        this.timeouts.size,

      total:
        this.intervals.size +
        this.timeouts.size,

      activeTimers:
        Array.from(
          this.metadata.values()
        ),

    };

  }

  /**
   * ===================================================
   * DESTROY
   * ===================================================
   */

  destroy() {

    this.clearAll();

  }

}

/**
 * =====================================================
 * SINGLETON
 * =====================================================
 */

export const runtimeTimerRegistry =
  new RuntimeTimerRegistry();

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

export default
  runtimeTimerRegistry;