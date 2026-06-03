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

    if (store.activationStatus === "checking") {
      return;
    }

    if (store.activationStatus === "activated") {
      // Đã activated — fetch avatar mới nhất từ players table bằng zaloUserId hoặc phone
      try {
        const zaloUserId = (store.identity as any)?.zaloUserId || "";
        const phone = (store.identity?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
        const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api";
        
        // Dùng zaloUserId để fetch nếu có
        let avatar = null;
        if (zaloUserId) {
          const res = await fetch(`${apiBase}/auth/player-avatar/${zaloUserId}`).catch(() => null);
          if (res?.ok) {
            const data = await res.json().catch(() => null);
            avatar = data?.avatar || null;
          }
        } else if (phone && phone.length >= 9) {
          const res = await fetch(`${apiBase}/profile-update/profile/${phone}`).catch(() => null);
          if (res?.ok) {
            const data = await res.json().catch(() => null);
            avatar = data?.data?.avatar || null;
          }
        }

        if (avatar) {
          store.setIdentity({ avatar });
          const { default: useAuthStore } = await import("@/stores/auth/authStore");
          const profile = useAuthStore.getState().profile;
          if (profile) useAuthStore.getState().updateProfile({ ...profile, avatar });
        }
      } catch(e) {}
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
        }        const payload = {
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
        };
        const result = await activateMiniAppUser(payload);

        const nameToSet = (result.fullName && result.fullName !== 'Khách hàng' ? result.fullName : identity?.fullName) || result.fullName || "";
        store.setIdentity({
          customerId:    result.customerId    || "",
          fullName:      nameToSet,
          phone:         (result.phone && result.phone !== "pending" ? result.phone : null) || (identity?.phone && identity.phone !== "pending" ? identity.phone : null) || "",
          avatar:        result.avatar || identity?.avatar || "",
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
    // Lưu zaloUserId để fetch avatar lần sau
    try {
      const uid = store.identity?.zaloUserId || (store.identity as any)?.zaloUserId || "";
      if (uid) localStorage.setItem("__zalo_uid", uid);
    } catch(e) {}
    runtimeLogger.info("RUNTIME", "[IDENTITY] Runtime identity ready");

  } catch(err) {
    console.warn("[IDENTITY] initializeCustomerIdentityEngine failed gracefully:", err);
    try {
      useRuntimeCustomerIdentityStore.getState().setActivationStatus("blocked");
    } catch(e) {}
  }
}
