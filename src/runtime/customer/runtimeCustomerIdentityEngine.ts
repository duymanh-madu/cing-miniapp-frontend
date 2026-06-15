import { requestPhonePermission, getZaloUserInfo } from "./runtimeCustomerPermissionEngine";
import { verifyOAFollowStatus, requestOAFollow } from "./runtimeCustomerFollowEngine";
import { activateCustomerMembership } from "./runtimeCustomerActivationEngine";
import { runtimeLogger } from "@/runtime/logger/runtimeLogger";
import { hydrateCustomerProfile } from "./runtimeCustomerProfileHydrator";
import { useRuntimeCustomerIdentityStore } from "./runtimeCustomerIdentityStore";
import { activateMiniAppUser } from "@/zalo/activation/activationApi";

function normalizePhone(phone: any) {
  return String(phone || "").replace(/\D/g, "").replace(/^84/, "0");
}

export async function initializeCustomerIdentityEngine() {
  const store = useRuntimeCustomerIdentityStore.getState();

  if (store.activationStatus === "checking") return;

  try {
    store.setActivationStatus("checking");
    runtimeLogger.info("RUNTIME", "[IDENTITY] User-triggered member activation starting");

    const [phoneGranted, zaloUserInfo] = await Promise.all([
      requestPhonePermission().catch(() => null),
      getZaloUserInfo().catch(() => null),
    ]);

    const phone = normalizePhone(phoneGranted);

    if (!phone || phone === "pending" || phone.length < 9) {
      store.setPermissionState({ phoneGranted: false, oaFollowed: false });
      store.setActivationStatus("guest" as any);
      store.setProfileHydrated(true);
      return;
    }

    let oaFollowed = await verifyOAFollowStatus().catch(() => false);

    if (!oaFollowed) {
      oaFollowed = await requestOAFollow().catch(() => false);
    }

    if (!oaFollowed) {
      store.setPermissionState({ phoneGranted: true, oaFollowed: false });
      store.setIdentity({ phone, phoneGranted: true, oaFollowed: false } as any);
      store.setActivationStatus("guest" as any);
      store.setProfileHydrated(true);
      return;
    }

    store.setPermissionState({ phoneGranted: true, oaFollowed: true });

    const activated = await activateCustomerMembership({
      phoneGranted: phone,
      oaFollowed: true,
    }).catch(() => false);

    if (!activated) {
      store.setIdentity({ phone, phoneGranted: true, oaFollowed: true } as any);
      store.setActivationStatus("guest" as any);
      store.setProfileHydrated(true);
      return;
    }

    const profile = await hydrateCustomerProfile().catch(() => ({
      customerId: "",
      fullName: "",
    }));

    const currentIdentity = store.identity as any;
    const zaloUserId = zaloUserInfo?.id || currentIdentity?.zaloUserId || "";
    const fullName = zaloUserInfo?.name || profile.fullName || currentIdentity?.fullName || "";
    const avatar = zaloUserInfo?.avatar || currentIdentity?.avatar || "";

    if (zaloUserId) {
      try {
        await activateMiniAppUser({
          zaloUserId,
          name: fullName,
          avatar,
          phone,
          phoneGranted: true,
          oaFollowed: true,
          activated: true,
          source: "zalo-miniapp",
          birthday: currentIdentity?.birthday || "",
        });
      } catch (e) {
        console.warn("[IDENTITY] activateMiniAppUser sync failed:", e);
      }
    }

    store.setIdentity({
      customerId: profile.customerId || "",
      fullName,
      phone,
      avatar,
      zaloUserId,
      memberActivated: true,
      phoneGranted: true,
      oaFollowed: true,
    } as any);

    store.setProfileHydrated(true);
    store.setActivationStatus("activated");

    try {
      if (zaloUserId) localStorage.setItem("__zalo_uid", zaloUserId);
      localStorage.setItem("__user_phone", phone);
    } catch (e) {}

    runtimeLogger.info("RUNTIME", "[IDENTITY] Member activation completed");
  } catch (err) {
    console.warn("[IDENTITY] initializeCustomerIdentityEngine failed gracefully:", err);
    try {
      store.setActivationStatus("guest" as any);
      store.setProfileHydrated(true);
    } catch (e) {}
  }
}
