const OA_ID =
  (import.meta as any).env?.VITE_ZALO_OA_ID ||
  (import.meta as any).env?.VITE_OA_ID ||
  "";

async function loadApis() {
  try {
    return await import("zmp-sdk/apis");
  } catch {
    return await import("zmp-sdk");
  }
}

export async function verifyOAFollowStatus(): Promise<boolean> {
  try {
    const apis: any = await loadApis();

    if (typeof apis.getFollowStatus === "function") {
      const result = await apis.getFollowStatus();
      return !!(result?.isFollowing || result?.followed || result?.status === "followed");
    }

    return false;
  } catch {
    return false;
  }
}

export async function requestOAFollow(): Promise<boolean> {
  try {
    const apis: any = await loadApis();

    if (typeof apis.followOA === "function") {
      const result = OA_ID
        ? await apis.followOA({ id: OA_ID })
        : await apis.followOA();

      return !!(result?.isFollowing || result?.followed || result?.success !== false);
    }

    if (typeof apis.requestFollow === "function") {
      const result = await apis.requestFollow();
      return !!(result?.isFollowing || result?.followed || result?.success !== false);
    }

    return false;
  } catch {
    return false;
  }
}

export async function followOARuntime(): Promise<boolean> {
  return requestOAFollow();
}
