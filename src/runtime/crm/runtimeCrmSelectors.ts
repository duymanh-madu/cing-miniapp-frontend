import {
  useRuntimeCrmSyncStore,
} from "./runtimeCrmSyncStore";

export function getRuntimeCrmCustomer() {

  return useRuntimeCrmSyncStore
    .getState()
    .customer;

}