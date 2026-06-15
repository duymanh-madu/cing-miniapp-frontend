import { memberDebugLog } from "@/utils/debug/memberActivationDebug";
export async function requestPhonePermission(): Promise<string | null> {
  try {
    const isZalo =
      typeof window !== "undefined" &&
      (
        (window as any).__ZALO_MINI_APP__ ||
        navigator.userAgent.includes("ZaloApp") ||
        navigator.userAgent.includes("Zalo") ||
        sessionStorage.getItem("zalo_source") === "zalo-miniapp"
      );

    if (!isZalo) {
      memberDebugLog("Không nhận diện được môi trường Zalo Mini App", { ua: navigator.userAgent, zaloFlag: (window as any).__ZALO_MINI_APP__ });
      console.warn("[PHONE] Not in Zalo Mini App environment");
      return null;
    }

    const zmpSdk = await import("zmp-sdk");

    let result: any = null;

    if (typeof (zmpSdk as any).requestPhoneNumber === "function") {
      result = await (zmpSdk as any).requestPhoneNumber();
    } else if (typeof (zmpSdk as any).getPhoneNumber === "function") {
      result = await (zmpSdk as any).getPhoneNumber();
    } else {
      memberDebugLog("Không tìm thấy API xin số điện thoại trong zmp-sdk", Object.keys(zmpSdk || {}));
      console.warn("[PHONE] No phone API found in zmp-sdk");
      return null;
    }

    memberDebugLog("Kết quả SDK xin số điện thoại", result);
    console.log("[PHONE] SDK result:", result);

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
      null
    );
  } catch (e) {
    memberDebugLog("Lỗi requestPhonePermission", { error: String(e?.message || e) });
    console.warn("[PHONE] requestPhonePermission failed:", e);
    return null;
  }
}

export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  try {
    const isZalo =
      typeof window !== "undefined" &&
      (
        (window as any).__ZALO_MINI_APP__ ||
        navigator.userAgent.includes("ZaloApp") ||
        navigator.userAgent.includes("Zalo") ||
        sessionStorage.getItem("zalo_source") === "zalo-miniapp"
      );

    if (!isZalo) return null;

    const zmpSdk = await import("zmp-sdk");

    if (typeof (zmpSdk as any).getUserInfo === "function") {
      const result: any = await (zmpSdk as any).getUserInfo({ avatarType: "large" });

      return {
        name: result?.userInfo?.name || result?.name || undefined,
        avatar: result?.userInfo?.avatar || result?.avatar || undefined,
        id: result?.userInfo?.id || result?.id || undefined,
      };
    }

    return null;
  } catch (e) {
    console.warn("[ZALO] getUserInfo failed:", e);
    return null;
  }
}
