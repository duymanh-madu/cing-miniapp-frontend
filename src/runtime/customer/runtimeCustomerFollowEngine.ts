const isZaloMiniApp = () => {
  if (typeof window === "undefined") return false;
  if (window.__ZALO_MINI_APP__) return true;
  if (navigator.userAgent.includes("ZaloApp")) return true;
  // Detect từ ZMP SDK
  if (typeof (window as any).ZaloJavaScriptInterface !== "undefined") return true;
  // Detect từ sessionStorage (set bởi runtimeBootstrap khi có source=zalo-miniapp)
  try {
    const src = new URLSearchParams(window.location.search).get("source");
    if (src === "zalo-miniapp") return true;
  } catch(e) {}
  // Check if came from zalo shell (stored in sessionStorage)
  return sessionStorage.getItem("zalo_source") === "zalo-miniapp";
};

export async function verifyOAFollowStatus(): Promise<boolean> {
  try {
    if (!isZaloMiniApp()) return false;
    const zmpSdk = await import("zmp-sdk");
    if (typeof zmpSdk?.getFollowStatus === "function") {
      const result = await zmpSdk.getFollowStatus();
      return result?.isFollowing ?? false;
    }
    return false;
  } catch(e) {
    console.warn("[OA] verifyOAFollowStatus failed:", e);
    return false;
  }
}

export async function requestOAFollow(): Promise<boolean> {
  try {
    if (!isZaloMiniApp()) return false;
    const zmpSdk = await import("zmp-sdk");
    if (typeof zmpSdk?.requestFollow === "function") {
      const result = await zmpSdk.requestFollow();
      return result?.isFollowing ?? false;
    }
    return false;
  } catch(e) {
    console.warn("[OA] requestOAFollow failed:", e);
    return false;
  }
}

export async function followOARuntime(): Promise<boolean> {
  return requestOAFollow();
}
