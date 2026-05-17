import {
  initializeGlobalErrorListener,
} from "../services/globalErrorListener";

import {
  initializeUnhandledRejectionListener,
} from "../services/unhandledRejectionListener";

export function bootstrapStabilityLayer() {

  initializeGlobalErrorListener();

  initializeUnhandledRejectionListener();

  console.log(
    "🛡 Stability layer booted"
  );

}