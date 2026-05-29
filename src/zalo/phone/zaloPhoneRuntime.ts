const isZaloMiniApp = () =>
  typeof window !== "undefined" &&
  ((window as any).__ZALO_MINI_APP__ === true ||
    navigator.userAgent.includes("ZaloApp"));

export async function getZaloPhone(): Promise<string | null> {
  if (!isZaloMiniApp()) return null;
  try {
    const zmpSdk = await import("zmp-sdk");
    if (typeof (zmpSdk as any).getPhoneNumber === "function") {
      const result = await (zmpSdk as any).getPhoneNumber();
      return result?.phoneNumber || result?.number || null;
    }
    return null;
  } catch (e) {
    console.warn("[PHONE] getZaloPhone failed:", e);
    return null;
  }
}

export async function requestZaloPhone(): Promise<string | null> {
  if (!isZaloMiniApp()) return null;
  try {
    const zmpSdk = await import("zmp-sdk");
    if (typeof (zmpSdk as any).requestPhoneNumber === "function") {
      const result = await (zmpSdk as any).requestPhoneNumber();
      const raw = result?.phoneNumber || result?.number || null;
      if (!raw) return null;
      const digits = String(raw).replace(/\D/g, "");
      if (digits.startsWith("84")) return "0" + digits.slice(2);
      if (digits.startsWith("0")) return digits;
      return null;
    }
    return null;
  } catch (e) {
    console.warn("[PHONE] requestZaloPhone failed:", e);
    return null;
  }
}

const zaloPhoneRuntime = { getZaloPhone, requestZaloPhone };
export default zaloPhoneRuntime;
