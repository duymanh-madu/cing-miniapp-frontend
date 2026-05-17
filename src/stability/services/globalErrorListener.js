import {
  useStabilityStore,
} from "../store/stabilityStore";

export function initializeGlobalErrorListener() {

  window.addEventListener(
    "error",
    (event) => {

      useStabilityStore
        .getState()
        .incrementCrash();

      useStabilityStore
        .getState()
        .setLastError(
          event.error
        );

    }
  );

}