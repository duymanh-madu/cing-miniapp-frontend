import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  initializeCustomerIdentityEngine,
} from "./runtimeCustomerIdentityEngine";

export async function initializeCustomerIdentityRuntime() {

  runtimeLogger.info("RUNTIME", 
    "[IDENTITY] Initializing customer identity runtime"
  );

  await initializeCustomerIdentityEngine();

  runtimeLogger.info("RUNTIME", 
    "[IDENTITY] Customer identity runtime ready"
  );

}