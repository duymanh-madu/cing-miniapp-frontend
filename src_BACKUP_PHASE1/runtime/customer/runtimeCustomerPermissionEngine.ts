import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import zaloPhoneRuntime from "@/zalo/phone/zaloPhoneRuntime";

import {
  useRuntimeCustomerIdentityStore,
} from "./runtimeCustomerIdentityStore";

export async function requestPhonePermission() {

  runtimeLogger.info(
    "RUNTIME",
    "[IDENTITY] Requesting Zalo phone permission"
  );

  const result =
    await zaloPhoneRuntime
      .requestPhoneNumber();

  const phoneGranted =
    Boolean(
      result?.success &&
      result?.phone
    );

  useRuntimeCustomerIdentityStore
    .getState()
    .setPermissionState({
      phoneGranted,
    });

  if (
    phoneGranted
  ) {

    useRuntimeCustomerIdentityStore
      .getState()
      .setIdentity({
        phone:
          typeof result.phone === "string"
            ? result.phone
            : result.phone?.number ||
              result.phone?.phoneNumber ||
              "",
      });

  }

  return phoneGranted;

}
