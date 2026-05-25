export async function requestPhonePermission(): Promise<string | null> {
  try {
    // Chi chay trong Zalo Mini App
    const isZalo = typeof window !== "undefined" &&
      (window.__ZALO_MINI_APP__ || navigator.userAgent.includes("ZaloApp"));
    if (!isZalo) return null;

    const zmpSdk = await import("zmp-sdk");
    if (typeof zmpSdk?.requestPhoneNumber === "function") {
      const result = await zmpSdk.requestPhoneNumber();
      return result?.number || null;
    }
    return null;
  } catch (e) {
    console.warn("[PHONE] requestPhonePermission failed:", e);
    return null;
  }
}
