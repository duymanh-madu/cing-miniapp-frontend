import { requestPhonePermission, getZaloUserInfo } from "./runtimeCustomerPermissionEngine";
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
      // Không check OA follow — tuân thủ Zalo policy 6.1

      // Đã activated — fetch avatar mới nhất từ players table
      try {
        const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api";
        // Ưu tiên: store > localStorage
        const zaloUserId = (store.identity as any)?.zaloUserId
          || (() => { try { return localStorage.getItem("__zalo_uid") || ""; } catch(e) { return ""; } })();
        const phone = (store.identity?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
        const savedPhone = (() => { try { return localStorage.getItem("__user_phone") || ""; } catch(e) { return ""; } })();
        const effectivePhone = (phone && phone !== "pending" && phone.length >= 9) ? phone : savedPhone;

        let avatar = null;
        // Fetch bằng zaloUserId
        if (zaloUserId) {
          const res = await fetch(`${apiBase}/auth/player-avatar/${zaloUserId}`).catch(() => null);
          if (res?.ok) {
            const data = await res.json().catch(() => null);
            avatar = data?.avatar || null;
          }
        }
        // Fallback: fetch bằng phone
        if (!avatar && effectivePhone && effectivePhone.length >= 9) {
          const res = await fetch(`${apiBase}/profile-update/profile/${effectivePhone}`).catch(() => null);
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
        // Không check OA follow — tuân thủ Zalo policy 6.1
        const birthday = (identity as any)?.birthday || "";
        store.setPermissionState({ phoneGranted: true, oaFollowed: true });        const payload = {
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
        // Ưu tiên phone từ backend (đã có trong DB) trước phone từ shell
        const backendPhone = result.phone && result.phone !== "pending" && String(result.phone).replace(/\D/g,"").length >= 9 ? result.phone : null;
        const shellPhone = identity?.phone && identity.phone !== "pending" && String(identity.phone).replace(/\D/g,"").length >= 9 ? identity.phone : null;
        const resolvedPhone = backendPhone || shellPhone || "";

        // Nếu không có phone hợp lệ → guest mode, không activate
        const isValidPhone = resolvedPhone && resolvedPhone !== "pending" && String(resolvedPhone).replace(/\D/g,"").length >= 9;
        if (!isValidPhone) {
          store.setActivationStatus("guest" as any);
          store.setProfileHydrated(true);
          runtimeLogger.info("RUNTIME", "[IDENTITY] Shell fast-path — no phone, guest mode");
          return;
        }

        store.setIdentity({
          customerId:    result.customerId    || "",
          fullName:      nameToSet,
          phone:         resolvedPhone,
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

    // NORMAL PATH: Check nếu đã có phone (từ lần trước hoặc từ useMemberRequired)
    const alreadyGranted = store.phoneGranted;
    if (!alreadyGranted) {
      // Chưa có phone — set guest mode, không xin phone
      store.setActivationStatus("guest" as any);
      store.setProfileHydrated(true);
      runtimeLogger.info("RUNTIME", "[IDENTITY] Guest mode — phone not yet granted");
      return;
    }

    // Có phone → activate
    const [phoneGranted, zaloUserInfo] = await Promise.all([
      requestPhonePermission().catch(() => store.phoneGranted || null),
      getZaloUserInfo().catch(() => null),
    ]);

    store.setPermissionState({ phoneGranted, oaFollowed: true });

    const activated = await activateCustomerMembership({ phoneGranted, oaFollowed: true })
      .catch(() => false);

    store.setIdentity({ phoneGranted, oaFollowed: true, memberActivated: activated });

    if (!activated) {
      store.setActivationStatus("guest" as any);
      return;
    }

    const profile = await hydrateCustomerProfile().catch(() => ({ customerId: "", fullName: "" }));

    if (zaloUserInfo?.id && typeof phoneGranted === "string" && phoneGranted.length >= 9) {
      try {
        await activateMiniAppUser({
          zaloUserId:   zaloUserInfo.id,
          name:         zaloUserInfo.name || profile.fullName || "",
          avatar:       zaloUserInfo.avatar || "",
          phone:        phoneGranted,
          phoneGranted: true,
          oaFollowed:   true,
          activated:    true,
          source:       "zalo-miniapp",
        });
      } catch(e) {
        console.warn("[IDENTITY] activateMiniAppUser (zaloUserId sync) failed:", e);
      }
    }

    store.setIdentity({
      customerId: profile.customerId || "",
      fullName: profile.fullName || zaloUserInfo?.name || "",
      avatar: zaloUserInfo?.avatar || (store.identity as any)?.avatar || "",
      zaloUserId: zaloUserInfo?.id || (store.identity as any)?.zaloUserId || "",
      memberActivated: true,
    } as any);
    store.setProfileHydrated(true);
    store.setActivationStatus("activated");
    try {
      const uid = zaloUserInfo?.id || (store.identity as any)?.zaloUserId || "";
      if (uid) localStorage.setItem("__zalo_uid", uid);
      const ph = (store.identity?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
      if (ph && ph.length >= 9 && ph !== "pending") localStorage.setItem("__user_phone", ph);
    } catch(e) {}
    runtimeLogger.info("RUNTIME", "[IDENTITY] Runtime identity activated");

  } catch(err) {
    console.warn("[IDENTITY] initializeCustomerIdentityEngine failed gracefully:", err);
    try {
      useRuntimeCustomerIdentityStore.getState().setActivationStatus("blocked");
    } catch(e) {}
  }
}
