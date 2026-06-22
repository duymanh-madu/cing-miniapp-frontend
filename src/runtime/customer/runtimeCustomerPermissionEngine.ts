export type PhonePermissionResult = {
  phone: string;
  phoneToken: string;
  miniAccessToken: string;
};

function isZaloShellContext(): boolean {
  // DEBUG
  const _href = window.location.href;
  const _search = window.location.search;
  const _hash = window.location.hash;
  console.log("[DEBUG URL]", { href: _href, search: _search, hash: _hash });
  alert("[DEBUG] href=" + _href + " search=" + _search);
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("source") === "zalo-miniapp";
  } catch {
    return false;
  }
}

function requestPhonePermissionFromShell(): Promise<PhonePermissionResult> {
  return new Promise((resolve, reject) => {
    const requestId = `phone_req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const TIMEOUT_MS = 15000;
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("Zalo shell không phản hồi. Vui lòng đóng app và mở lại trong Zalo."));
    }, TIMEOUT_MS);
    function handler(e: MessageEvent) {
      const data = e.data;
      if (!data || data.type !== "ZALO_PHONE_PERMISSION_RESULT") return;
      if (data.requestId && data.requestId !== requestId) return;
      clearTimeout(timer);
      window.removeEventListener("message", handler);
      if (!data.success) { reject(new Error(data.error || "Zalo từ chối cấp quyền.")); return; }
      if (!data.phoneToken) { reject(new Error("Shell không trả phoneToken.")); return; }
      resolve({ phone: data.phone || "", phoneToken: data.phoneToken, miniAccessToken: data.miniAccessToken || "" });
    }
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "REQUEST_ZALO_PHONE_PERMISSION", requestId }, "*");
  });
}

function pickAccessToken(result: any): string {
  return result?.accessToken || result?.access_token || result?.token || result?.data?.accessToken || result?.data?.access_token || result?.data?.token || "";
}

function pickPhoneToken(result: any): string {
  return result?.token || result?.data?.token || result?.phoneToken || result?.data?.phoneToken || result?.phone_token || result?.data?.phone_token || result?.numberToken || result?.data?.numberToken || "";
}

async function callMaybeCallbackApi(fn: any, args: any = {}) {
  if (typeof fn !== "function") return null;
  try { const direct = await fn(args); if (direct) return direct; } catch (e) { throw e; }
  return new Promise((resolve, reject) => {
    try { fn({ ...args, success: resolve, fail: reject }); } catch (e) { reject(e); }
  });
}

async function requestPhonePermissionDirect(): Promise<PhonePermissionResult> {
  let miniAccessToken = "";
  for (const mod of ["zmp-sdk/apis", "zmp-sdk"]) {
    try { const m: any = await import(mod as any); const token = pickAccessToken(await callMaybeCallbackApi(m.getAccessToken)); if (token) { miniAccessToken = token; break; } } catch {}
  }
  let phoneToken = ""; let lastErr: any = null;
  for (const mod of ["zmp-sdk/apis", "zmp-sdk"]) {
    try { const m: any = await import(mod as any); const token = pickPhoneToken(await callMaybeCallbackApi(m.getPhoneNumber)); if (token) { phoneToken = token; break; } } catch (e: any) { lastErr = e; }
  }
  if (!phoneToken) throw new Error(lastErr?.message && lastErr.message !== "Unknown error. Please try again later." ? lastErr.message : "Không lấy được quyền số điện thoại từ Zalo.");
  if (!miniAccessToken) throw new Error("Không lấy được access token Mini App từ Zalo.");
  return { phone: "", phoneToken, miniAccessToken };
}

export async function requestPhonePermission(): Promise<PhonePermissionResult | null> {
  if (isZaloShellContext()) {
    console.log("[ACTIVATION] Zalo shell context → bridge to shell");
    return requestPhonePermissionFromShell();
  }
  console.log("[ACTIVATION] Standalone context → direct zmp-sdk");
  return requestPhonePermissionDirect();
}

export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  try {
    const apis: any = await import("zmp-sdk/apis" as any);
    if (typeof apis.getUserInfo === "function") {
      const result: any = await apis.getUserInfo({ avatarType: "large" });
      return { name: result?.userInfo?.name || result?.name, avatar: result?.userInfo?.avatar || result?.avatar, id: result?.userInfo?.id || result?.id };
    }
  } catch {}
  try {
    const sdk: any = await import("zmp-sdk" as any);
    if (typeof sdk.getUserInfo !== "function") return null;
    const result: any = await callMaybeCallbackApi(sdk.getUserInfo, { avatarType: "large" });
    return { name: result?.userInfo?.name || result?.name, avatar: result?.userInfo?.avatar || result?.avatar, id: result?.userInfo?.id || result?.id };
  } catch { return null; }
}
