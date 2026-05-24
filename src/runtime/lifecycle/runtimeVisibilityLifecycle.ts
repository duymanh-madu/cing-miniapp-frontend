import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * RUNTIME VISIBILITY LIFECYCLE
 * =====================================================
 * SOCKET RECOVERY IS GOVERNED
 * BY runtimeSocketClient.ts
 * =====================================================
 */

let hiddenAt = 0;

let initialized = false;

export function initializeRuntimeVisibilityLifecycle() {

  if (initialized) {

    return;

  }

  initialized = true;

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.visibilityState ===
        "hidden"
      ) {

        hiddenAt =
          Date.now();

        runtimeLogger.info("RUNTIME", 
          "[LIFECYCLE] APP HIDDEN"
        );

        return;

      }

      const hiddenDuration =
        Date.now() -
        hiddenAt;

      runtimeLogger.info("RUNTIME", 
        "[LIFECYCLE] APP RESUMED",
        hiddenDuration
      );

    }
  );

  window.addEventListener(
    "focus",
    () => {

      runtimeLogger.info("RUNTIME", 
        "[LIFECYCLE] WINDOW FOCUS"
      );

    }
  );

}