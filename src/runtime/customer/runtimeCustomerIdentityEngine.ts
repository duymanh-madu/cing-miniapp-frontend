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
  "cing iu",
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

async function activateCustomerIdentityAuthority() {
  const store = useRuntimeCustomerIdentityStore.getState();



  try {
    store.setActivationStatus("checking");

    const phoneGrant = await requestPhonePermission();

    if (!phoneGrant?.phoneToken || !phoneGrant?.miniAccessToken) {
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
    const zaloUserInfo = phoneGrant?.zaloUserInfo?.id ? phoneGrant.zaloUserInfo : await getZaloUserInfo({forceRefresh:true}).catch(() => null);
    const currentIdentity = store.identity as any;

    const zaloUserId = zaloUserInfo?.id || "";
    if (!zaloUserId) throw new Error("Chưa xác minh được tài khoản Zalo hiện tại. Vui lòng thử lại.");
    const fullName = pickRuntimeName(zaloUserInfo?.name, currentIdentity?.fullName);
    const avatar = zaloUserInfo?.avatar || currentIdentity?.avatar || "";

    const result = await activateMiniAppUser({
      zaloUserId,
      name: fullName,
      avatar,
      phone: "", // Backend derives the phone from fresh Zalo proof.
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

    const resolvedFullName = pickRuntimeName(
      result?.fullName,
      fullName,
      currentIdentity?.fullName
    );

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
    if(err?.code === "AUTH_SESSION_SUPERSEDED") return;
    store.setProfileHydrated(true);
    store.setActivationStatus("failed");
    throw err;
  }
}

let activationInFlight: Promise<void> | null = null;
export function initializeCustomerIdentityEngine() {
 if(activationInFlight)return activationInFlight;
 activationInFlight=activateCustomerIdentityAuthority().finally(()=>{activationInFlight=null;});
 return activationInFlight;
}
