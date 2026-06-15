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
      console.warn("[PHONE] No phone API found in zmp-sdk");
      return null;
    }

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
