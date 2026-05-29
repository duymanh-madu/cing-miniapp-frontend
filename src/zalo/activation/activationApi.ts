import { createSession } from "@/infra/auth/authSession";

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
    createSession({
      accessToken:  data.accessToken  || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token || null,
      profile: {
        id:     data.customer?.id     || data.customer?.zalo_id || "",
        name:   data.customer?.name   || input.name             || "",
        phone:  data.customer?.phone  || input.phone            || "",
        avatar: data.customer?.avatar || input.avatar           || "",
      },
    });
  }

  return {
    ...data,
    customerId:    data.customer?.id            || "",
    fullName:      data.customer?.name          || "",
    phone:         data.customer?.phone         || input.phone,
    totalSpent:    data.customer?.total_spent   || 0,
    monthlySpent:  data.customer?.monthly_spent || 0,
    loyaltyPoints: data.customer?.points        || 0,
    memberTier:    data.customer?.member_level  || "hoi_vien",
    oaFollowed:    input.oaFollowed,
    activated:     true,
  };
}
