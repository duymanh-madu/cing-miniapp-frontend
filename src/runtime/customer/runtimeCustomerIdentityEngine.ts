import { memberDebugLog } from "@/utils/debug/memberActivationDebug";
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
    memberDebugLog("Bắt đầu kích hoạt thành viên");
    runtimeLogger.info("RUNTIME", "[IDENTITY] User-triggered member activation starting");

    const phoneRaw = await requestPhonePermission().catch((e) => { memberDebugLog("Xin SĐT lỗi", { error: String(e?.message || e) }); return null; });
    memberDebugLog("phoneRaw nhận được", phoneRaw);
    const phone = normalizePhone(phoneRaw);

    memberDebugLog("SĐT sau normalize", { phone });

    if (!phone || phone === "pending" || phone.length < 9) {
      store.setPermissionState({ phoneGranted: false, oaFollowed: false });
      store.setIdentity({ phone: "", phoneGranted: false, oaFollowed: false } as any);
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
      return;
    }

    store.setIdentity({ phone, phoneGranted: true } as any);
    store.setPermissionState({ phoneGranted: true });

    let oaFollowed = await verifyOAFollowStatus().catch((e) => { memberDebugLog("Check OA lỗi", { error: String(e?.message || e) }); return false; });
    memberDebugLog("Trạng thái follow OA", { oaFollowed });

    if (!oaFollowed) {
      oaFollowed = await requestOAFollow().catch((e) => { memberDebugLog("Request follow OA lỗi", { error: String(e?.message || e) }); return false; });
      memberDebugLog("Kết quả request follow OA", { oaFollowed });
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

    memberDebugLog("Bắt đầu activateCustomerMembership", { phone, oaFollowed: true });

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
      memberDebugLog("Gọi backend activateMiniAppUser", { phone, zaloUserId, fullName });
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
    memberDebugLog("Kích hoạt thành viên thành công", { phone, zaloUserId });

    try {
      if (zaloUserId) localStorage.setItem("__zalo_uid", zaloUserId);
      localStorage.setItem("__user_phone", phone);
    } catch (e) {}

    runtimeLogger.info("RUNTIME", "[IDENTITY] Member activation completed");
  } catch (err) {
    memberDebugLog("Lỗi tổng initializeCustomerIdentityEngine", { error: String((err as any)?.message || err) });
    console.warn("[IDENTITY] initializeCustomerIdentityEngine failed gracefully:", err);
    try {
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
    } catch (e) {}
  }
}
