import {
  mapCrmCustomer,
} from "./runtimeCrmMappingEngine";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  useRuntimeCrmSyncStore,
} from "./runtimeCrmSyncStore";

export function syncRuntimeCrmCustomer(
  payload: any
) {

  runtimeLogger.info("RUNTIME", 
    "[CRM] Sync started"
  );

  const customer =
    mapCrmCustomer(
      payload
    );

  useRuntimeCrmSyncStore
    .getState()
    .setCustomer(
      customer
    );

  useRuntimeCrmSyncStore
    .getState()
    .setCrmSynced(
      true
    );

  runtimeLogger.info("RUNTIME", 
    "[CRM] Sync completed",
    customer
  );

}