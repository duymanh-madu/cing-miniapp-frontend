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
        // Check OA follow — trong iframe ZMP SDK không available
        // Dùng normal path để check
        const oaFollowed = await verifyOAFollowStatus().catch(() => false);
        store.setPermissionState({ phoneGranted: true, oaFollowed });
        runtimeLogger.info("RUNTIME", "[IDENTITY] Shell fast-path: oaFollowed=" + oaFollowed);

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
        });

        store.setIdentity({
          customerId:    result.customerId    || "",
          fullName:      (result.fullName && result.fullName !== 'Khách hàng' ? result.fullName : identity?.fullName) || result.fullName || "",
          phone:         result.phone         || identity?.phone    || "",
          memberActivated: true,
          phoneGranted:  true,
          oaFollowed:    true,
        });
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
