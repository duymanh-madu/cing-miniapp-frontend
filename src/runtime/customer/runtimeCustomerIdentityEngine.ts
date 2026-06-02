import { requestPhonePermission } from "./runtimeCustomerPermissionEngine";
import { verifyOAFollowStatus } from "./runtimeCustomerFollowEngine";
import { activateCustomerMembership } from "./runtimeCustomerActivationEngine";
import { runtimeLogger } from "@/runtime/logger/runtimeLogger";
import { hydrateCustomerProfile } from "./runtimeCustomerProfileHydrator";
import { useRuntimeCustomerIdentityStore } from "./runtimeCustomerIdentityStore";
import { activateMiniAppUser } from "@/zalo/activation/activationApi";

export async function initializeCustomerIdentityEngine() {
  try {
    const store = useRuntimeCustomerIdentityStore.getState();

    if (store.activationStatus === "checking" || store.activationStatus === "activated") {
      return;
    }

    store.setActivationStatus("checking");
    runtimeLogger.info("RUNTIME", "[IDENTITY] Runtime identity initializing");

    // FAST PATH: nếu shell đã inject zaloUserId → gọi thẳng backend
    const identity = store.identity;
    const zaloUserId = identity?.zaloUserId || "";

    if (zaloUserId) {
      runtimeLogger.info("RUNTIME", "[IDENTITY] Shell fast-path: zaloUserId found", { zaloUserId });
      try {
        // OA follow và birthday đã được xử lý trong shell
        const oaFollowed = !!(identity as any)?.oaFollowed;
        const birthday   = (identity as any)?.birthday || "";
        store.setPermissionState({ phoneGranted: true, oaFollowed });
        runtimeLogger.info("RUNTIME", "[IDENTITY] Shell fast-path: oaFollowed=" + oaFollowed + " birthday=" + !!birthday);

        if (!oaFollowed) {
          runtimeLogger.info("RUNTIME", "[IDENTITY] Shell fast-path: missing OA follow, blocked");
          store.setActivationStatus("blocked");
          return;
        }

        const result = await activateMiniAppUser({
          zaloUserId,
          name:         identity?.fullName  || "",
          avatar:       identity?.avatar    || "",
          phone:        identity?.phone     || "",
          phoneToken:       (identity as any)?.phoneToken       || "",
          miniAccessToken:  (identity as any)?.miniAccessToken  || "",
          phoneGranted: true,
          oaFollowed:   true,
          activated:    true,
          source:       "zalo-miniapp",
          birthday:     birthday,
        });

        const nameToSet = (result.fullName && result.fullName !== 'Khách hàng' ? result.fullName : identity?.fullName) || result.fullName || "";
        console.log("[ENGINE] setIdentity — result.fullName:", result.fullName, "nameToSet:", nameToSet, "result.avatar:", result.avatar);
        store.setIdentity({
          customerId:    result.customerId    || "",
          fullName:      nameToSet,
          phone:         (result.phone && result.phone !== "pending" ? result.phone : null) || (identity?.phone && identity.phone !== "pending" ? identity.phone : null) || "",
          avatar:        result.avatar || identity?.avatar || "",
          memberActivated: true,
          phoneGranted:  true,
          oaFollowed:    true,
        });
        console.log("[ENGINE] after setIdentity — store.fullName:", store.identity?.fullName);
        store.setProfileHydrated(true);
        store.setActivationStatus("activated");
        runtimeLogger.info("RUNTIME", "[IDENTITY] Shell fast-path activated");
        return;
      } catch (e) {
        console.warn("[IDENTITY] Shell fast-path failed, falling through:", e);
      }
    }

    // NORMAL PATH: SDK flow
    const [phoneGranted, oaFollowed] = await Promise.all([
      requestPhonePermission().catch(() => null),
      verifyOAFollowStatus().catch(() => false),
    ]);

    store.setPermissionState({ phoneGranted, oaFollowed });
    runtimeLogger.info("RUNTIME", "[IDENTITY] Permission status", { phoneGranted, oaFollowed });

    const activated = await activateCustomerMembership({ phoneGranted, oaFollowed })
      .catch(() => false);

    store.setIdentity({ phoneGranted, oaFollowed, memberActivated: activated });

    if (!activated) {
      store.setActivationStatus("blocked");
      return;
    }

    const profile = await hydrateCustomerProfile().catch(() => ({
      customerId: "", fullName: ""
    }));

    store.setIdentity({
      customerId:      profile.customerId || "",
      fullName:        profile.fullName   || "",
      memberActivated: true,
    });

    store.setProfileHydrated(true);
    store.setActivationStatus("activated");
    runtimeLogger.info("RUNTIME", "[IDENTITY] Runtime identity ready");

  } catch(err) {
    console.warn("[IDENTITY] initializeCustomerIdentityEngine failed gracefully:", err);
    try {
      useRuntimeCustomerIdentityStore.getState().setActivationStatus("blocked");
    } catch(e) {}
  }
}
