const isZaloMiniApp = () =>
  typeof window !== "undefined" &&
  ((window as any).__ZALO_MINI_APP__ === true ||
    navigator.userAgent.includes("ZaloApp"));

export async function checkOAFollow(): Promise<boolean> {
  if (!isZaloMiniApp()) return false;
  try {
    const zmpSdk = await import("zmp-sdk");
    if (typeof (zmpSdk as any).getFollowStatus === "function") {
      const result = await (zmpSdk as any).getFollowStatus();
      return result?.isFollowing ?? false;
    }
    return false;
  } catch (e) {
    console.warn("[OA] checkOAFollow failed:", e);
    return false;
  }
}

export async function followZaloOA(): Promise<boolean> {
  if (!isZaloMiniApp()) return false;
  try {
    const zmpSdk = await import("zmp-sdk");
    if (typeof (zmpSdk as any).requestFollow === "function") {
      const result = await (zmpSdk as any).requestFollow();
      return result?.isFollowing ?? result?.followed ?? false;
    }
    if (typeof (zmpSdk as any).followOA === "function") {
      const result = await (zmpSdk as any).followOA({
        id: import.meta.env.VITE_ZALO_OA_ID || "",
      });
      return result?.followed ?? false;
    }
    return false;
  } catch (e) {
    console.warn("[OA] followZaloOA failed:", e);
    return false;
  }
}

const followOARuntime = { checkOAFollow, followZaloOA };
export default followOARuntime;
