export type PhonePermissionResult = {
  phone: string;
  phoneToken: string;
  miniAccessToken: string;
  zaloUserInfo?: { id: string; name: string; avatar: string };
};

function requestPhonePermissionFromShell(): Promise<PhonePermissionResult> {
  return new Promise((resolve, reject) => {
    const requestId = `phone_req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("__SHELL_TIMEOUT__"));
    }, 5000);
    function handler(e: MessageEvent) {
      const data = e.data;
      if (!data || data.type !== "ZALO_PHONE_PERMISSION_RESULT") return;
      if (data.requestId && data.requestId !== requestId) return;
      clearTimeout(timer);
      window.removeEventListener("message", handler);
      if (!data.success) { reject(new Error(data.error || "Zalo từ chối cấp quyền.")); return; }
      if (!data.phoneToken) { reject(new Error("Shell không trả phoneToken.")); return; }
      resolve({ phone: data.phone || "", phoneToken: data.phoneToken, miniAccessToken: data.miniAccessToken || "", zaloUserInfo: data.zaloUserInfo || undefined });
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
  try {
    return await requestPhonePermissionFromShell();
  } catch (err: any) {
    if (err?.message === "__SHELL_TIMEOUT__") {
      return requestPhonePermissionDirect();
    }
    throw err;
  }
}

// Cache userInfo từ phone permission result
let _cachedUserInfo: { id: string; name: string; avatar: string } | null = null;

export function setCachedZaloUserInfo(info: { id: string; name: string; avatar: string }) {
  _cachedUserInfo = info;
}

export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  if (_cachedUserInfo?.id) return _cachedUserInfo;
  // Fallback: request qua shell
  try {
    const result: any = await new Promise((resolve, reject) => {
      const requestId = `userinfo_${Date.now()}`;
      const timer = setTimeout(() => { window.removeEventListener("message", handler); reject(new Error("timeout")); }, 5000);
      function handler(e: MessageEvent) {
        const data = e.data;
        if (!data || data.type !== "ZALO_USER_INFO_RESULT") return;
        if (data.requestId && data.requestId !== requestId) return;
        clearTimeout(timer);
        window.removeEventListener("message", handler);
        resolve(data);
      }
      window.addEventListener("message", handler);
      window.parent.postMessage({ type: "REQUEST_ZALO_USER_INFO", requestId }, "*");
    });
    if (result?.id) {
      _cachedUserInfo = { id: result.id, name: result.name || "", avatar: result.avatar || "" };
      return _cachedUserInfo;
    }
  } catch {}
  return null;
}
