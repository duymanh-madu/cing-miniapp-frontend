// ─────────────────────────────────────────────────────────────────────────────
// runtimeCustomerPermissionEngine.ts
//
// BUG FIX: Frontend không được gọi zmp-sdk trực tiếp vì chạy trong iframe
// trên Vercel — không phải native Zalo context.
//
// ĐÚNG: Frontend gửi REQUEST_ZALO_PHONE_PERMISSION lên shell qua postMessage,
// shell (chạy native trong Zalo) gọi zmp-sdk rồi trả kết quả về.
// ─────────────────────────────────────────────────────────────────────────────

export type PhonePermissionResult = {
  phone: string;
  phoneToken: string;
  miniAccessToken: string;
};

// Kiểm tra có đang chạy trong iframe (Zalo shell) không
function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin → chắc chắn trong iframe
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BRIDGE: Gửi message lên shell, chờ kết quả trả về
// ─────────────────────────────────────────────────────────────────────────────
function requestPhonePermissionFromShell(): Promise<PhonePermissionResult> {
  return new Promise((resolve, reject) => {
    const requestId = `phone_req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const TIMEOUT_MS = 15000;

    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("Zalo shell không phản hồi quyền số điện thoại. Vui lòng mở lại app trong Zalo."));
    }, TIMEOUT_MS);

    function handler(e: MessageEvent) {
      const data = e.data;
      if (!data || data.type !== "ZALO_PHONE_PERMISSION_RESULT") return;
      // Khớp requestId để tránh nhầm response cũ
      if (data.requestId && data.requestId !== requestId) return;

      clearTimeout(timer);
      window.removeEventListener("message", handler);

      if (!data.success) {
        reject(new Error(data.error || "Zalo shell từ chối cấp quyền số điện thoại."));
        return;
      }

      if (!data.phoneToken) {
        reject(new Error("Shell không trả phoneToken. Vui lòng thử lại."));
        return;
      }

      resolve({
        phone: data.phone || "",
        phoneToken: data.phoneToken,
        miniAccessToken: data.miniAccessToken || "",
      });
    }

    window.addEventListener("message", handler);

    // Gửi request lên shell (window.parent)
    window.parent.postMessage(
      { type: "REQUEST_ZALO_PHONE_PERMISSION", requestId },
      "*"
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK: Gọi thẳng zmp-sdk khi chạy ngoài iframe (dev local / zmp-cli)
// ─────────────────────────────────────────────────────────────────────────────
function pickAccessToken(result: any): string {
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

function pickPhoneToken(result: any): string {
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
      fn({ ...args, success: resolve, fail: reject });
    } catch (e) {
      reject(e);
    }
  });
}

async function requestPhonePermissionDirect(): Promise<PhonePermissionResult> {
  // getAccessToken
  let miniAccessToken = "";
  for (const mod of ["zmp-sdk/apis", "zmp-sdk"]) {
    try {
      const m: any = await import(/* @vite-ignore */ mod);
      const result = await callMaybeCallbackApi(m.getAccessToken);
      const token = pickAccessToken(result);
      if (token) { miniAccessToken = token; break; }
    } catch {}
  }

  // getPhoneNumber
  let phoneToken = "";
  let lastErr: any = null;
  for (const mod of ["zmp-sdk/apis", "zmp-sdk"]) {
    try {
      const m: any = await import(/* @vite-ignore */ mod);
      const result = await callMaybeCallbackApi(m.getPhoneNumber);
      const token = pickPhoneToken(result);
      if (token) { phoneToken = token; break; }
      console.warn("[ACTIVATION] getPhoneNumber no token:", result);
    } catch (e: any) {
      lastErr = e;
      console.warn("[ACTIVATION] getPhoneNumber failed:", e?.message);
    }
  }

  if (!phoneToken) {
    throw new Error(
      lastErr?.message && lastErr.message !== "Unknown error. Please try again later."
        ? lastErr.message
        : "Không lấy được quyền số điện thoại từ Zalo. Vui lòng đóng Mini App, mở lại trong Zalo và thử lại."
    );
  }

  if (!miniAccessToken) {
    throw new Error("Không lấy được access token Mini App từ Zalo.");
  }

  return { phone: "", phoneToken, miniAccessToken };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CHÍNH — tự chọn đúng strategy
// ─────────────────────────────────────────────────────────────────────────────
export async function requestPhonePermission(): Promise<PhonePermissionResult | null> {
  if (isInsideIframe()) {
    // Đang chạy trong Zalo shell → nhờ shell gọi zmp-sdk
    console.log("[ACTIVATION] Running inside iframe → bridge to shell");
    return await requestPhonePermissionFromShell();
  } else {
    // Dev local hoặc standalone → gọi thẳng zmp-sdk
    console.log("[ACTIVATION] Running standalone → direct zmp-sdk call");
    return await requestPhonePermissionDirect();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserInfo — giữ nguyên, không đổi
// ─────────────────────────────────────────────────────────────────────────────
export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  try {
    const apis: any = await import(/* @vite-ignore */ "zmp-sdk/apis");
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
    const sdk: any = await import(/* @vite-ignore */ "zmp-sdk");
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
