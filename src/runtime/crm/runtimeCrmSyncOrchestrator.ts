import {
  mapCrmCustomer,
} from "./runtimeCrmMappingEngine";

import {
  useRuntimeCrmSyncStore,
} from "./runtimeCrmSyncStore";

export function syncRuntimeCrmCustomer(
  payload: any
) {

  console.log(
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

  console.log(
    "[CRM] Sync completed",
    customer
  );

}