import { requestPhonePermission, getZaloUserInfo } from "./runtimeCustomerPermissionEngine";
import { verifyOAFollowStatus, requestOAFollow } from "./runtimeCustomerFollowEngine";
import { activateCustomerMembership } from "./runtimeCustomerActivationEngine";
import { runtimeLogger } from "@/runtime/logger/runtimeLogger";
import { hydrateCustomerProfile } from "./runtimeCustomerProfileHydrator";
import { useRuntimeCustomerIdentityStore } from "./runtimeCustomerIdentityStore";
import { activateMiniAppUser } from "@/zalo/activation/activationApi";

function normalizePhone(phone: unknown) {
  const n = String(phone || "").replace(/\D/g, "");
  if (!n) return "";
  return n.startsWith("84") ? "0" + n.slice(2) : n;
}

export async function initializeCustomerIdentityEngine() {
  const store = useRuntimeCustomerIdentityStore.getState();

  if (store.activationStatus === "checking") return;

  try {
    store.setActivationStatus("checking");
    runtimeLogger.info("RUNTIME", "[IDENTITY] User-triggered member activation starting");

    const phoneRaw = await requestPhonePermission().catch(() => null);
    const phone = normalizePhone(phoneRaw);

    if (!phone || phone === "pending" || phone.length < 9) {
      store.setPermissionState({ phoneGranted: false, oaFollowed: false });
      store.setIdentity({ phone: "", phoneGranted: false, oaFollowed: false } as any);
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
      return;
    }

    store.setIdentity({ phone, phoneGranted: true } as any);
    store.setPermissionState({ phoneGranted: true });

    let oaFollowed = await verifyOAFollowStatus().catch(() => false);

    if (!oaFollowed) {
      oaFollowed = await requestOAFollow().catch(() => false);
    }

    if (!oaFollowed) {
      store.setPermissionState({ phoneGranted: true, oaFollowed: false });
      store.setIdentity({ phone, phoneGranted: true, oaFollowed: false } as any);
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
      return;
    }

    store.setPermissionState({ phoneGranted: true, oaFollowed: true });
    store.setIdentity({ phone, phoneGranted: true, oaFollowed: true } as any);

    const activated = await activateCustomerMembership({
      phoneGranted: phone,
      oaFollowed: true,
    }).catch(() => false);

    if (!activated) {
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
      return;
    }

    const zaloUserInfo = await getZaloUserInfo().catch(() => null);
    const profile = await hydrateCustomerProfile().catch(() => ({
      customerId: "",
      fullName: "",
    }));

    const currentIdentity = store.identity as any;
    const zaloUserId = zaloUserInfo?.id || currentIdentity?.zaloUserId || "";
    const fullName = zaloUserInfo?.name || profile.fullName || currentIdentity?.fullName || "";
    const avatar = zaloUserInfo?.avatar || currentIdentity?.avatar || "";

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
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
      return;
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
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
    } catch (e) {}
  }
}
