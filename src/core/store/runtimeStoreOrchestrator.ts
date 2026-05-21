import {
  runtimeStoreRegistry,
} from "./runtimeStoreRegistry";

export function initializeRuntimeStores() {

  console.log(
    "[STORE] Initializing runtime stores"
  );

  console.log(
    runtimeStoreRegistry
  );

  console.log(
    "[STORE] Runtime stores ready"
  );

}