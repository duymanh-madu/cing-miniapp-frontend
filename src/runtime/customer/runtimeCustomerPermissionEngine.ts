export type PhonePermissionResult = {
  phone: string;
  phoneToken: string;
  miniAccessToken: string;
};

function pickAccessToken(result: any) {
  return (
    result?.accessToken ||
    result?.access_token ||
    result?.token ||
    result?.data?.accessToken ||
    result?.data?.access_token ||
    result?.data?.token ||
    ""
  );
}

function pickPhoneToken(result: any) {
  return (
    result?.token ||
    result?.data?.token ||
    result?.phoneToken ||
    result?.data?.phoneToken ||
    result?.phone_token ||
    result?.data?.phone_token ||
    result?.numberToken ||
    result?.data?.numberToken ||
    ""
  );
}

async function callMaybeCallbackApi(fn: any, args: any = {}) {
  if (typeof fn !== "function") return null;

  try {
    const direct = await fn(args);
    if (direct) return direct;
  } catch (e) {
    throw e;
  }

  return await new Promise((resolve, reject) => {
    try {
      fn({
        ...args,
        success: resolve,
        fail: reject,
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function getMiniAccessToken() {
  const attempts: Array<() => Promise<any>> = [];

  try {
    const apis: any = await import("zmp-sdk/apis");
    attempts.push(() => callMaybeCallbackApi(apis.getAccessToken));
  } catch {}

  try {
    const sdk: any = await import("zmp-sdk");
    attempts.push(() => callMaybeCallbackApi(sdk.getAccessToken));
  } catch {}

  for (const run of attempts) {
    try {
      const result = await run();
      const token = pickAccessToken(result);
      if (token) return token;
    } catch (e: any) {
      console.warn("[ACTIVATION] getAccessToken attempt failed:", e?.message || e);
    }
  }

  return "";
}

async function getPhoneToken() {
  const attempts: Array<() => Promise<any>> = [];

  try {
    const apis: any = await import("zmp-sdk/apis");
    attempts.push(() => callMaybeCallbackApi(apis.getPhoneNumber));
  } catch {}

  try {
    const sdk: any = await import("zmp-sdk");
    attempts.push(() => callMaybeCallbackApi(sdk.getPhoneNumber));
  } catch {}

  let lastError: any = null;

  for (const run of attempts) {
    try {
      const result = await run();
      const token = pickPhoneToken(result);
      if (token) return token;

      console.warn("[ACTIVATION] getPhoneNumber returned no token:", result);
    } catch (e: any) {
      lastError = e;
      console.warn("[ACTIVATION] getPhoneNumber attempt failed:", e?.message || e);
    }
  }

  if (lastError?.message && lastError.message !== "Unknown error. Please try again later.") {
    throw new Error(lastError.message);
  }

  throw new Error(
    "Không lấy được quyền số điện thoại từ Zalo. Vui lòng đóng Mini App, mở lại trong Zalo và thử lại."
  );
}

export async function requestPhonePermission(): Promise<PhonePermissionResult | null> {
  const miniAccessToken = await getMiniAccessToken();
  const phoneToken = await getPhoneToken();

  if (!phoneToken) {
    throw new Error("Bạn chưa cấp quyền số điện thoại hoặc Zalo chưa trả token số điện thoại.");
  }

  if (!miniAccessToken) {
    throw new Error("Không lấy được access token Mini App từ Zalo. Vui lòng mở lại app trong Zalo và thử lại.");
  }

  return {
    phone: "",
    phoneToken,
    miniAccessToken,
  };
}

export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  try {
    const apis: any = await import("zmp-sdk/apis");
    if (typeof apis.getUserInfo === "function") {
      const result: any = await apis.getUserInfo({ avatarType: "large" });

      return {
        name: result?.userInfo?.name || result?.name || undefined,
        avatar: result?.userInfo?.avatar || result?.avatar || undefined,
        id: result?.userInfo?.id || result?.id || undefined,
      };
    }
  } catch {}

  try {
    const sdk: any = await import("zmp-sdk");
    if (typeof sdk.getUserInfo !== "function") return null;

    const result: any = await callMaybeCallbackApi(sdk.getUserInfo, { avatarType: "large" });

    return {
      name: result?.userInfo?.name || result?.name || undefined,
      avatar: result?.userInfo?.avatar || result?.avatar || undefined,
      id: result?.userInfo?.id || result?.id || undefined,
    };
  } catch {
    return null;
  }
}
