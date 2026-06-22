export type PhonePermissionResult = {
  phone: string;
  phoneToken: string;
  miniAccessToken: string;
};

export async function requestPhonePermission(): Promise<PhonePermissionResult | null> {
  const apis: any = await import("zmp-sdk/apis");

  if (typeof apis.getPhoneNumber !== "function") {
    throw new Error("Thiết bị chưa hỗ trợ API lấy số điện thoại.");
  }

  let miniAccessToken = "";

  try {
    if (typeof apis.getAccessToken === "function") {
      const accessResult: any = await apis.getAccessToken();

      miniAccessToken =
        accessResult?.accessToken ||
        accessResult?.access_token ||
        accessResult?.token ||
        accessResult?.data?.accessToken ||
        accessResult?.data?.access_token ||
        accessResult?.data?.token ||
        "";
    }
  } catch (e: any) {
    console.warn("[ACTIVATION] getAccessToken failed:", e?.message || e);
  }

  let phoneResult: any = null;

  try {
    phoneResult = await apis.getPhoneNumber();
  } catch (e: any) {
    console.warn("[ACTIVATION] getPhoneNumber failed:", e?.message || e);
    throw new Error(
      e?.message && e.message !== "Unknown error. Please try again later."
        ? e.message
        : "Không lấy được quyền số điện thoại từ Zalo. Vui lòng đóng Mini App, mở lại trong Zalo và thử lại."
    );
  }

  const phoneToken =
    phoneResult?.token ||
    phoneResult?.data?.token ||
    phoneResult?.phoneToken ||
    phoneResult?.data?.phoneToken ||
    phoneResult?.phone_token ||
    phoneResult?.data?.phone_token ||
    "";

  if (!phoneToken) {
    console.warn("[ACTIVATION] Missing phone token:", phoneResult);
    throw new Error("Bạn chưa cấp quyền số điện thoại hoặc Zalo chưa trả token số điện thoại.");
  }

  if (!miniAccessToken) {
    console.warn("[ACTIVATION] Missing mini access token");
    throw new Error("Không lấy được access token Mini App từ Zalo. Vui lòng mở lại app trong Zalo và thử lại.");
  }

  return {
    phone: "",
    phoneToken,
    miniAccessToken,
  };
}

export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  try {
    const apis: any = await import("zmp-sdk/apis");
    if (typeof apis.getUserInfo !== "function") return null;

    const result: any = await apis.getUserInfo({ avatarType: "large" });

    return {
      name: result?.userInfo?.name || result?.name || undefined,
      avatar: result?.userInfo?.avatar || result?.avatar || undefined,
      id: result?.userInfo?.id || result?.id || undefined,
    };
  } catch {
    return null;
  }
}
