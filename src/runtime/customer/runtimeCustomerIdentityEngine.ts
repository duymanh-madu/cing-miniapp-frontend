import { requestPhonePermission, getZaloUserInfo } from "./runtimeCustomerPermissionEngine";
import { verifyOAFollowStatus, requestOAFollow } from "./runtimeCustomerFollowEngine";
import { runtimeLogger } from "@/runtime/logger/runtimeLogger";
import { useRuntimeCustomerIdentityStore } from "./runtimeCustomerIdentityStore";
import { activateMiniAppUser } from "@/zalo/activation/activationApi";
import { memberDebugLog } from "@/utils/debug/memberActivationDebug";

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

    const phoneGrant = await requestPhonePermission();
    memberDebugLog("phoneGrant nhận được", phoneGrant);

    if (!phoneGrant?.phoneToken) {
      store.setPermissionState({ phoneGranted: false, oaFollowed: false });
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
      return;
    }

    let oaFollowed = await verifyOAFollowStatus().catch(() => false);
    memberDebugLog("Trạng thái follow OA", { oaFollowed });

    if (!oaFollowed) {
      oaFollowed = await requestOAFollow().catch(() => false);
      memberDebugLog("Kết quả request follow OA", { oaFollowed });
    }

    if (!oaFollowed) {
      store.setPermissionState({ phoneGranted: true, oaFollowed: false });
      store.setProfileHydrated(true);
      store.setActivationStatus("guest" as any);
      return;
    }

    const zaloUserInfo = await getZaloUserInfo().catch(() => null);
    const currentIdentity = store.identity as any;

    const zaloUserId = zaloUserInfo?.id || currentIdentity?.zaloUserId || "";
    const fullName = zaloUserInfo?.name || currentIdentity?.fullName || "";
    const avatar = zaloUserInfo?.avatar || currentIdentity?.avatar || "";

    memberDebugLog("Gọi backend activateMiniAppUser", {
      zaloUserId,
      fullName,
      hasPhoneToken: !!phoneGrant.phoneToken,
      hasMiniAccessToken: !!phoneGrant.miniAccessToken,
    });

    const result = await activateMiniAppUser({
      zaloUserId,
      name: fullName,
      avatar,
      phone: normalizePhone(phoneGrant.phone),
      phoneToken: phoneGrant.phoneToken,
      miniAccessToken: phoneGrant.miniAccessToken,
      phoneGranted: true,
      oaFollowed: true,
      activated: true,
      source: "zalo-miniapp",
      birthday: currentIdentity?.birthday || "",
    });

    const resolvedPhone = normalizePhone(result?.phone || phoneGrant.phone);

    store.setPermissionState({ phoneGranted: true, oaFollowed: true });

    store.setIdentity({
      customerId: result?.customerId || "",
      fullName: result?.fullName || fullName,
      phone: resolvedPhone,
      avatar: result?.avatar || avatar,
      zaloUserId,
      memberActivated: true,
      phoneGranted: true,
      oaFollowed: true,
    } as any);

    store.setProfileHydrated(true);
    store.setActivationStatus("activated");

    try {
      if (zaloUserId) localStorage.setItem("__zalo_uid", zaloUserId);
      if (resolvedPhone) localStorage.setItem("__user_phone", resolvedPhone);
    } catch (e) {}

    memberDebugLog("Kích hoạt thành viên thành công", { phone: resolvedPhone, zaloUserId });
  } catch (err: any) {
    memberDebugLog("Lỗi tổng initializeCustomerIdentityEngine", {
      error: String(err?.message || err),
    });
    store.setProfileHydrated(true);
    store.setActivationStatus("guest" as any);
  }
}
