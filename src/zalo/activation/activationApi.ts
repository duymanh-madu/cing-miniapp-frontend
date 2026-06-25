import { createSession } from "@/infra/auth/authSession";
import useAuthStore from "@/stores/auth";

const BACKEND_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api");

export interface ActivateMiniAppUserInput {
  phone:        string;
  phoneGranted: boolean;
  oaFollowed:   boolean;
  activated:    boolean;
  source:       string;
  zaloUserId?:  string;
  name?:        string;
  avatar?:      string;
  birthday?:    string;
  phoneToken?:       string;
  miniAccessToken?:  string;
}

export async function activateMiniAppUser(input: ActivateMiniAppUserInput): Promise<any> {
  const payload = {
    zalo_id:       input.zaloUserId   || "",
    name:          input.name         || "",
    avatar:        input.avatar       || "",
    phone:         input.phone        || "",
    phone_granted: input.phoneGranted,
    oa_followed:   input.oaFollowed,
    activated:     input.activated,
    source:        input.source       || "zalo-miniapp",
    birthday:      input.birthday     || null,
    phone_token:        input.phoneToken       || "",
    mini_access_token:  input.miniAccessToken  || "",
  };

  const res = await fetch(`${BACKEND_URL}/auth/zalo/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Activation failed: ${res.status}`);
  }

  const json = await res.json();
  const data = json.data || json;

  if (data.accessToken || data.access_token) {
    const resolvedPhone =
      data.customer?.phone ||
      (input.phone !== "pending" ? input.phone : "") ||
      "";

    const existingProfile =
      useAuthStore.getState().profile;

    const existingPhone =
      String(existingProfile?.phone || "")
        .replace(/\D/g, "")
        .replace(/^84/, "0");

    const normalizedResolvedPhone =
      String(resolvedPhone || "")
        .replace(/\D/g, "")
        .replace(/^84/, "0");

    const canReuseExistingProfile =
      existingProfile &&
      existingPhone &&
      normalizedResolvedPhone &&
      existingPhone === normalizedResolvedPhone;

    const backendName =
      (data.customer?.fullName && data.customer?.fullName !== "Khách hàng"
        ? data.customer.fullName
        : null) ||
      (data.customer?.name && data.customer?.name !== "Khách hàng"
        ? data.customer.name
        : null);

    createSession({
      accessToken:  data.accessToken  || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token || null,
      profile: {
        id:     data.customer?.id || data.customer?.zalo_id || existingProfile?.id || "",
        name:   backendName || (canReuseExistingProfile ? existingProfile?.name : "") || input.name || "",
        phone:  resolvedPhone,
        avatar: data.customer?.avatar || (canReuseExistingProfile ? existingProfile?.avatar : "") || input.avatar || "",
      },
    });

    try {
      if (resolvedPhone && resolvedPhone !== "pending") {
        window.parent?.postMessage({
          type: "CACHE_MEMBER_IDENTITY",
          phone: resolvedPhone,
          zaloId: input.zaloUserId || data.customer?.zalo_id || data.customer?.zalo_user_id || "",
          name: backendName || input.name || "",
          avatar: data.customer?.avatar || input.avatar || "",
        }, "*");
      }
    } catch {}
  }

  return {
    ...data,
    customerId:    data.customer?.id            || "",
    fullName:      data.customer?.fullName || data.customer?.name || "",
    phone:         data.customer?.phone         || input.phone,
    totalSpent:    data.customer?.total_spent   || 0,
    monthlySpent:  data.customer?.monthly_spent || 0,
    loyaltyPoints: data.customer?.points        || 0,
    memberTier:    data.customer?.member_level  || "hoi_vien",
    oaFollowed:    input.oaFollowed,
    activated:     true,
  };
}
