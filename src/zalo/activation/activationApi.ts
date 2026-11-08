import {currentCustomerPhoneV42} from "@/infra/auth/currentCustomerIdentityV42.js";
import {advanceAuthSessionEpochV42,requireAuthSessionEpochV42} from "@/infra/auth/authSessionEpochV42.js";
import { createSession } from "@/infra/auth/authSession";
import useAuthStore from "@/stores/auth";
import { getOrCreateRuntimeDeviceId } from "@/runtime/session/runtimeDeviceIdentity";
import { registerLocalDeviceReauthCredential } from "@/infra/auth/localDeviceReauth";

const BACKEND_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api");

const GENERIC_PROFILE_NAMES = new Set([
  "khách hàng",
  "khach hang",
  "khách",
  "khach",
  "guest",
  "hội viên",
  "hoi vien",
]);

function cleanProfileName(value: unknown) {
  const name = String(value || "").trim();
  if (!name) return "";
  if (GENERIC_PROFILE_NAMES.has(name.toLowerCase())) return "";
  return name;
}

function pickProfileName(...values: unknown[]) {
  for (const value of values) {
    const name = cleanProfileName(value);
    if (name) return name;
  }
  return "";
}

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
  const expectedEpoch=advanceAuthSessionEpochV42();
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
    installation_id:   getOrCreateRuntimeDeviceId(),
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
  let data = json.data || json;
  const acceptedToken=String(data.accessToken||data.access_token||"").trim();
  if(!acceptedToken)throw Object.assign(new Error("Chưa xác nhận được phiên đăng nhập. Vui lòng thử lại."),{code:"AUTH_LOGIN_SESSION_MISSING"});
  if(typeof data.customer?.id!=="string" || !data.customer.id.trim() || !currentCustomerPhoneV42(data.customer?.phone)){
    const sessionResponse=await fetch(`${BACKEND_URL}/auth/session`,{headers:{Authorization:`Bearer ${acceptedToken}`},cache:"no-store"});
    if(!sessionResponse.ok)throw Object.assign(new Error("Chưa xác nhận được tài khoản."),{code:"AUTH_LOGIN_CUSTOMER_MISSING"});
    const sessionJson=await sessionResponse.json();
    const customer=sessionJson.data?.customer||sessionJson.customer;
    if(typeof customer?.id!=="string" || !customer.id.trim() || !currentCustomerPhoneV42(customer.phone))throw Object.assign(new Error("Chưa xác nhận được tài khoản."),{code:"AUTH_LOGIN_CUSTOMER_MISSING"});
    data={...data,customer};
  }

  requireAuthSessionEpochV42(expectedEpoch);
  if (data.accessToken || data.access_token) {
    const resolvedPhone =
      currentCustomerPhoneV42(data.customer?.phone);

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
      existingProfile.id === data.customer.id &&
      existingPhone &&
      normalizedResolvedPhone &&
      existingPhone === normalizedResolvedPhone;

    const backendName = pickProfileName(
      data.customer?.fullName,
      data.customer?.name
    );

    const sessionName = pickProfileName(
      backendName,
      canReuseExistingProfile ? existingProfile?.name : "",
      input.name
    );

    createSession({
      accessToken:  data.accessToken  || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token || null,
      profile: {
        ...(canReuseExistingProfile ? existingProfile : {}),
        ...data.customer,
        id:     data.customer?.id || "",
        name:   sessionName,
        phone:  resolvedPhone,
        avatar: data.customer?.avatar || (canReuseExistingProfile ? existingProfile?.avatar : "") || input.avatar || "",
      },
    });

    /*
     * Canonical Zalo login is also the enrollment authority
     * for durable returning-member reauthentication.
     *
     * Failure is deliberately non-fatal for this authenticated
     * lifecycle. The next cold lifecycle will simply use the
     * canonical Zalo fallback again.
     */
    /*
     * Cached phone + Zalo identity remains a legacy login
     * compatibility path only.
     *
     * Durable enrollment requires a fresh Zalo token pair;
     * backend independently verifies the phone proof.
     */
    if (
      input.phoneToken &&
      input.miniAccessToken
    ) {
      await registerLocalDeviceReauthCredential(
        input.phoneToken,
        input.miniAccessToken
      ).catch(() => false);
    }

    const acceptedProfile=useAuthStore.getState();
    if(!acceptedProfile.authenticated || acceptedProfile.profile?.id!==data.customer.id || currentCustomerPhoneV42(acceptedProfile.profile?.phone)!==resolvedPhone) {
      throw Object.assign(new Error("Session changed during activation."),{code:"AUTH_SESSION_SUPERSEDED"});
    }
    try {
      if (resolvedPhone && resolvedPhone !== "pending") {
        window.parent?.postMessage({
          type: "CACHE_MEMBER_IDENTITY",
          phone: resolvedPhone,
          zaloId: input.zaloUserId || data.customer?.zalo_id || data.customer?.zalo_user_id || "",
          name: sessionName || pickProfileName(input.name),
          avatar: data.customer?.avatar || input.avatar || "",
        }, "*");
      }
    } catch {}
  }

  return {
    ...data,
    customerId:    data.customer?.id            || "",
    fullName:      pickProfileName(useAuthStore.getState().profile?.display_name, useAuthStore.getState().profile?.name, data.customer?.fullName, data.customer?.name),
    phone:         currentCustomerPhoneV42(data.customer?.phone),
    totalSpent:    data.customer?.total_spent   || 0,
    monthlySpent:  data.customer?.monthly_spent || 0,
    loyaltyPoints: data.customer?.points        || 0,
    memberTier:    data.customer?.member_level  || "hoi_vien",
    oaFollowed:    input.oaFollowed,
    activated:     true,
  };
}
