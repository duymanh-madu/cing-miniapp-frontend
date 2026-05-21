import {
  initializeCustomerIdentityEngine,
} from "./runtimeCustomerIdentityEngine";

export async function initializeCustomerIdentityRuntime() {

  console.log(
    "[IDENTITY] Initializing customer identity runtime"
  );

  await initializeCustomerIdentityEngine();

  console.log(
    "[IDENTITY] Customer identity runtime ready"
  );

}