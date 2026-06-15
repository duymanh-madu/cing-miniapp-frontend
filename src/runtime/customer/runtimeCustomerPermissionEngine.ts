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

  const phoneResult: any = await apis.getPhoneNumber();

  const phoneToken =
    phoneResult?.token ||
    phoneResult?.data?.token ||
    phoneResult?.phoneToken ||
    phoneResult?.data?.phoneToken ||
    "";

  let miniAccessToken = "";

  if (typeof apis.getAccessToken === "function") {
    const accessResult: any = await apis.getAccessToken();
    miniAccessToken =
      accessResult?.accessToken ||
      accessResult?.access_token ||
      accessResult?.token ||
      "";
  }

  if (!phoneToken) {
    throw new Error("Bạn chưa cấp quyền số điện thoại.");
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
