import { memberDebugLog } from "@/utils/debug/memberActivationDebug";

export type PhonePermissionResult = {
  phone: string;
  phoneToken: string;
  miniAccessToken: string;
};

export async function requestPhonePermission(): Promise<PhonePermissionResult | null> {
  try {
    const apis: any = await import("zmp-sdk/apis");

    memberDebugLog("Đã load zmp-sdk/apis", Object.keys(apis || {}));

    if (typeof apis.getPhoneNumber !== "function") {
      memberDebugLog("Không tìm thấy getPhoneNumber trong zmp-sdk/apis", Object.keys(apis || {}));
      return null;
    }

    const phoneResult: any = await apis.getPhoneNumber();
    memberDebugLog("Kết quả getPhoneNumber", phoneResult);

    const phoneToken =
      phoneResult?.token ||
      phoneResult?.data?.token ||
      "";

    let miniAccessToken = "";

    if (typeof apis.getAccessToken === "function") {
      const accessResult: any = await apis.getAccessToken();
      memberDebugLog("Kết quả getAccessToken", accessResult);

      miniAccessToken =
        accessResult?.accessToken ||
        accessResult?.access_token ||
        accessResult?.token ||
        "";
    }

    if (!phoneToken) {
      memberDebugLog("Không lấy được phone token từ getPhoneNumber");
      return null;
    }

    return {
      phone: "",
      phoneToken,
      miniAccessToken,
    };
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
    const apis: any = await import("zmp-sdk/apis");

    if (typeof apis.getUserInfo !== "function") {
      return null;
    }

    const result: any = await apis.getUserInfo({ avatarType: "large" });
    memberDebugLog("Kết quả getUserInfo", result);

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
