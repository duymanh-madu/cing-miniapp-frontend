import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import followOARuntime from "@/zalo/follow/followOARuntime";

import {
  useRuntimeCustomerIdentityStore,
} from "./runtimeCustomerIdentityStore";

export async function verifyOAFollowStatus() {

  runtimeLogger.info(
    "RUNTIME",
    "[IDENTITY] Requesting OA follow"
  );

  const oaFollowed =
    await followOARuntime
      .requestFollow();

  useRuntimeCustomerIdentityStore
    .getState()
    .setPermissionState({
      oaFollowed,
    });

  return Boolean(
    oaFollowed
  );

}
