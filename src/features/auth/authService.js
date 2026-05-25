import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

const isZaloMiniApp = typeof window !== "undefined" &&
  (window.__ZALO_MINI_APP__ || navigator.userAgent.includes("ZaloApp"));

async function loginZalo() {
  try {
    const zmpSdk = await import("zmp-sdk");
    const { login, getUserInfo, getPhoneNumber } = zmpSdk;
    const loginResult = await login();
    const accessToken = loginResult?.token;
    const userInfo = await getUserInfo({ accessToken });
    const zaloUserId = userInfo?.id;
    const zaloName = userInfo?.name;
    const zaloAvatar = userInfo?.avatar;
    let phone = "";
    try {
      const phoneResult = await getPhoneNumber({ accessToken });
      phone = phoneResult?.number || "";
    } catch(e) { console.warn("Phone permission denied"); }

    const bootstrapRes = await apiClient.post("/activation/bootstrap", {
      phone, zaloUserId, zaloName, zaloAvatar
    });
    const customer = bootstrapRes.data?.customer;
    useAuthStore.getState().setSession({
      accessToken,
      profile: {
        id: zaloUserId, userId: zaloUserId,
        name: customer?.fullName || zaloName,
        phone, avatar: zaloAvatar,
      }
    });
    return { success: true };
  } catch(err) {
    console.error("Zalo login error:", err);
    return { success: false, error: err.message };
  }
}

async function loginMock() {
  useAuthStore.getState().setSession({
    accessToken: "mock-token",
    profile: {
      id: "mock-user-001", userId: "mock-user-001",
      name: "Khách", phone: "", avatar: null,
    }
  });
  return { success: true, isMock: true };
}

export async function loginGuest() {
  if (isZaloMiniApp) return loginZalo();
  return loginMock();
}

export async function setPhoneForMembership(phone) {
  const current = useAuthStore.getState().profile;
  if (current) useAuthStore.getState().updateProfile({ ...current, phone });
}
