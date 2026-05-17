import {
  useStabilityStore,
} from "../store/stabilityStore";

export function initializeUnhandledRejectionListener() {

  window.addEventListener(
    "unhandledrejection",
    (event) => {

      useStabilityStore
        .getState()
        .setLastError(
          event.reason
        );

    }
  );

}