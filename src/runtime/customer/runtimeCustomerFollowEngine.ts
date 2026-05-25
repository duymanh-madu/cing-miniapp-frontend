const isZaloMiniApp = () =>
  typeof window !== "undefined" &&
  (window.__ZALO_MINI_APP__ || navigator.userAgent.includes("ZaloApp"));

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
