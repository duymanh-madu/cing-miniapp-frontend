import { memberDebugLog } from "@/utils/debug/memberActivationDebug";

function extractPhoneFromSdkResult(result: any): string | null {
  return (
    result?.number ||
    result?.phoneNumber ||
    result?.phone ||
    result?.token ||
    result?.phoneToken ||
    result?.data?.number ||
    result?.data?.phoneNumber ||
    result?.data?.phone ||
    result?.data?.token ||
    result?.data?.phoneToken ||
    null
  );
}

export async function requestPhonePermission(): Promise<string | null> {
  try {
    const zmpSdk: any = await import("zmp-sdk");

    memberDebugLog("Đã load zmp-sdk", {
      keys: Object.keys(zmpSdk || {}),
      ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
      zaloFlag: typeof window !== "undefined" ? (window as any).__ZALO_MINI_APP__ : undefined,
    });

    let result: any = null;

    if (typeof zmpSdk.requestPhoneNumber === "function") {
      memberDebugLog("Gọi zmpSdk.requestPhoneNumber");
      result = await zmpSdk.requestPhoneNumber();
    } else if (typeof zmpSdk.getPhoneNumber === "function") {
      memberDebugLog("Gọi zmpSdk.getPhoneNumber");
      result = await zmpSdk.getPhoneNumber();
    } else if (typeof zmpSdk.default?.requestPhoneNumber === "function") {
      memberDebugLog("Gọi zmpSdk.default.requestPhoneNumber");
      result = await zmpSdk.default.requestPhoneNumber();
    } else if (typeof zmpSdk.default?.getPhoneNumber === "function") {
      memberDebugLog("Gọi zmpSdk.default.getPhoneNumber");
      result = await zmpSdk.default.getPhoneNumber();
    } else {
      memberDebugLog("Không tìm thấy API xin số điện thoại trong zmp-sdk", Object.keys(zmpSdk || {}));
      return null;
    }

    memberDebugLog("Kết quả SDK xin số điện thoại", result);

    return extractPhoneFromSdkResult(result);
  } catch (e: any) {
    memberDebugLog("Lỗi requestPhonePermission", {
      error: String(e?.message || e),
      stack: String(e?.stack || "").slice(0, 300),
    });
    return null;
  }
}

export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  try {
    const zmpSdk: any = await import("zmp-sdk");

    let result: any = null;

    if (typeof zmpSdk.getUserInfo === "function") {
      result = await zmpSdk.getUserInfo({ avatarType: "large" });
    } else if (typeof zmpSdk.default?.getUserInfo === "function") {
      result = await zmpSdk.default.getUserInfo({ avatarType: "large" });
    } else {
      return null;
    }

    return {
      name: result?.userInfo?.name || result?.name || undefined,
      avatar: result?.userInfo?.avatar || result?.avatar || undefined,
      id: result?.userInfo?.id || result?.id || undefined,
    };
  } catch (e: any) {
    memberDebugLog("Lỗi getZaloUserInfo", { error: String(e?.message || e) });
    return null;
  }
}
