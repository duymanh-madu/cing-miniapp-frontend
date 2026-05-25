import { requestPhonePermission } from "./runtimeCustomerPermissionEngine";
import { verifyOAFollowStatus } from "./runtimeCustomerFollowEngine";
import { activateCustomerMembership } from "./runtimeCustomerActivationEngine";
import { runtimeLogger } from "@/runtime/logger/runtimeLogger";
import { hydrateCustomerProfile } from "./runtimeCustomerProfileHydrator";
import { useRuntimeCustomerIdentityStore } from "./runtimeCustomerIdentityStore";

export async function initializeCustomerIdentityEngine() {
  try {
    const store = useRuntimeCustomerIdentityStore.getState();

    if (store.activationStatus === "checking" || store.activationStatus === "activated") {
      return;
    }

    store.setActivationStatus("checking");
    runtimeLogger.info("RUNTIME", "[IDENTITY] Runtime identity initializing");

    // Guard: toan bo Zalo SDK calls deu catch de khong crash tren Safari/web
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
      customerId: profile.customerId || "",
      fullName: profile.fullName || "",
      memberActivated: true,
    });

    store.setProfileHydrated(true);
    store.setActivationStatus("activated");
    runtimeLogger.info("RUNTIME", "[IDENTITY] Runtime identity ready");

  } catch(err) {
    // Khong bao gio de crash app vi Zalo SDK
    console.warn("[IDENTITY] initializeCustomerIdentityEngine failed gracefully:", err);
    try {
      useRuntimeCustomerIdentityStore.getState().setActivationStatus("blocked");
    } catch(e) {}
  }
}
