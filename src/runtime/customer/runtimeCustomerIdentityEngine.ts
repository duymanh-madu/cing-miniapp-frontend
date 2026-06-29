import { requestPhonePermission, getZaloUserInfo, setCachedZaloUserInfo } from "./runtimeCustomerPermissionEngine";
import { verifyOAFollowStatus, requestOAFollow } from "./runtimeCustomerFollowEngine";
import { activateCustomerMembership } from "./runtimeCustomerActivationEngine";
import { useRuntimeCustomerIdentityStore } from "./runtimeCustomerIdentityStore";
import { activateMiniAppUser } from "@/zalo/activation/activationApi";

function normalizePhone(phone: unknown) {
  const n = String(phone || "").replace(/\D/g, "");
  if (!n) return "";
  return n.startsWith("84") ? "0" + n.slice(2) : n;
}

const GENERIC_RUNTIME_NAMES = new Set([
  "khách hàng",
  "khach hang",
  "khách",
  "khach",
  "guest",
  "hội viên",
  "hoi vien",
]);

function cleanRuntimeName(value: unknown) {
  const name = String(value || "").trim();
  if (!name) return "";
  if (GENERIC_RUNTIME_NAMES.has(name.toLowerCase())) return "";
  return name;
}

function pickRuntimeName(...values: unknown[]) {
  for (const value of values) {
    const name = cleanRuntimeName(value);
    if (name) return name;
  }
  return "";
}

export async function initializeCustomerIdentityEngine() {
  const store = useRuntimeCustomerIdentityStore.getState();

  if (store.activationStatus === "checking") return;

  try {
    store.setActivationStatus("checking");

    const phoneGrant = await requestPhonePermission();

    if (!phoneGrant?.phoneToken) {
      throw new Error("Bạn cần đồng ý cấp quyền số điện thoại để kích hoạt thành viên.");
    }

    let oaFollowed = await verifyOAFollowStatus();

    if (!oaFollowed) {
      oaFollowed = await requestOAFollow();
    }

    if (!oaFollowed) {
      throw new Error("Bạn cần theo dõi Zalo OA để lưu điểm, nhận quà và sử dụng tính năng thành viên.");
    }

    const localEligible = await activateCustomerMembership({
      phoneGranted: phoneGrant.phoneToken,
      oaFollowed: true,
    });

    if (!localEligible) {
      throw new Error("Tài khoản chưa đủ điều kiện kích hoạt thành viên.");
    }

    // Cache userInfo từ phone permission nếu có
    if (phoneGrant?.zaloUserInfo?.id) {
      setCachedZaloUserInfo(phoneGrant.zaloUserInfo);
    }
    const zaloUserInfo = await getZaloUserInfo().catch(() => null);
    const currentIdentity = store.identity as any;

    const zaloUserId = zaloUserInfo?.id || currentIdentity?.zaloUserId || "";
    const fullName = pickRuntimeName(zaloUserInfo?.name, currentIdentity?.fullName);
    const avatar = zaloUserInfo?.avatar || currentIdentity?.avatar || "";

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

    store.setPermissionState({
      phoneGranted: true,
      oaFollowed: true,
    });

    const resolvedFullName = pickRuntimeName(result?.fullName, fullName) || "Cing iu";

    store.setIdentity({
      customerId: result?.customerId || "",
      fullName: resolvedFullName,
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
    } catch {}
  } catch (err: any) {
    store.setProfileHydrated(true);
    store.setActivationStatus("guest" as any);
    throw err;
  }
}
