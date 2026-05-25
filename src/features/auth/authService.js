import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

/**
 * AUTH SERVICE
 * - Production: Zalo Mini App SDK cung cap phone + zaloUserId tu dong
 * - Development: Mock user de test UI
 */

/* Detect Zalo Mini App environment */
const isZaloMiniApp = typeof window !== "undefined" &&
  (window.__ZALO_MINI_APP__ || navigator.userAgent.includes("ZaloApp"));

/* ── ZALO MINI APP AUTH ── */
async function loginZalo() {
  try {
    // Zalo SDK - chi chay trong Zalo Mini App
    const { login, getUserInfo, getPhoneNumber } = await import("@zmp-sdk/apis");

    // 1. Login lay access token
    const loginResult = await login();
    const accessToken = loginResult?.token;

    // 2. Lay thong tin user
    const userInfo = await getUserInfo({ accessToken });
    const zaloUserId = userInfo?.id;
    const zaloName = userInfo?.name;
    const zaloAvatar = userInfo?.avatar;

    // 3. Xin quyen lay so dien thoai
    let phone = "";
    try {
      const phoneResult = await getPhoneNumber({ accessToken });
      phone = phoneResult?.number || "";
    } catch (e) {
      console.warn("Phone permission denied");
    }

    // 4. Bootstrap voi backend - luu player + lay iPOS data
    const bootstrapRes = await apiClient.post("/activation/bootstrap", {
      phone, zaloUserId, zaloName, zaloAvatar
    });

    const customer = bootstrapRes.data?.customer;

    // 5. Set auth store
    useAuthStore.getState().setSession({
      accessToken,
      profile: {
        id: zaloUserId,
        userId: zaloUserId,
        name: customer?.fullName || zaloName,
        phone,
        avatar: zaloAvatar,
        tier: customer?.memberTier,
        points: customer?.loyaltyPoints,
      }
    });

    return { success: true };
  } catch (err) {
    console.error("Zalo login error:", err);
    return { success: false, error: err.message };
  }
}

/* ── DEVELOPMENT MOCK AUTH ── */
async function loginMock() {
  // Set mock profile de test UI - khong can Zalo SDK
  useAuthStore.getState().setSession({
    accessToken: "mock-token",
    profile: {
      id: "mock-user-001",
      userId: "mock-user-001",
      name: "Test Member",
      phone: "", // Trong - useMembership se skip API call
      avatar: null,
      tier: "member",
      points: 0,
    }
  });
  return { success: true, isMock: true };
}

/* ── EXPORTED LOGIN ── */
export async function loginGuest() {
  if (isZaloMiniApp) {
    return loginZalo();
  }
  return loginMock();
}

export async function setPhoneForMembership(phone) {
  // Cho phep set phone thu cong khi test tren web
  const current = useAuthStore.getState().profile;
  if (current) {
    useAuthStore.getState().updateProfile({ ...current, phone });
  }
}
