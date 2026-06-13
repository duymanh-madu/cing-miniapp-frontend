const fs = require('fs');
const file = 'src/runtime/customer/runtimeCustomerPermissionEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const old = `export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string } | null> {
  try {
    const isZalo = typeof window !== "undefined" &&
      (window.__ZALO_MINI_APP__ || navigator.userAgent.includes("ZaloApp"));
    if (!isZalo) return null;

    const zmpSdk = await import("zmp-sdk");
    if (typeof zmpSdk?.getUserInfo === "function") {
      const result = await zmpSdk.getUserInfo({ avatarType: "large" });
      return {
        name:   result?.userInfo?.name   || undefined,
        avatar: result?.userInfo?.avatar || undefined,
      };
    }
    return null;
  } catch (e) {
    console.warn("[ZALO] getUserInfo failed:", e);
    return null;
  }
}`;

const newStr = `export async function getZaloUserInfo(): Promise<{ name?: string; avatar?: string; id?: string } | null> {
  try {
    const isZalo = typeof window !== "undefined" &&
      (window.__ZALO_MINI_APP__ || navigator.userAgent.includes("ZaloApp"));
    if (!isZalo) return null;

    const zmpSdk = await import("zmp-sdk");
    if (typeof zmpSdk?.getUserInfo === "function") {
      const result = await zmpSdk.getUserInfo({ avatarType: "large" });
      return {
        name:   result?.userInfo?.name   || undefined,
        avatar: result?.userInfo?.avatar || undefined,
        id:     result?.userInfo?.id     || undefined,
      };
    }
    return null;
  } catch (e) {
    console.warn("[ZALO] getUserInfo failed:", e);
    return null;
  }
}`;

if (!content.includes(old)) { console.log('ERROR: pattern not found'); process.exit(1); }
content = content.replace(old, newStr);
fs.writeFileSync(file, content, 'utf8');
console.log('done');
