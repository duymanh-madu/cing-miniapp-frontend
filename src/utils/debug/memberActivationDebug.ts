export function memberDebugLog(message: string, data?: any) {
  try {
    const item = {
      time: new Date().toLocaleTimeString("vi-VN"),
      message,
      data: data ? JSON.stringify(data).slice(0, 500) : "",
    };

    const key = "__member_activation_debug";
    const old = JSON.parse(sessionStorage.getItem(key) || "[]");
    old.push(item);
    sessionStorage.setItem(key, JSON.stringify(old.slice(-20)));

    window.dispatchEvent(new CustomEvent("member_activation_debug", { detail: item }));
    console.log("[MEMBER DEBUG]", message, data || "");
  } catch (e) {}
}

export function getMemberDebugLogs() {
  try {
    return JSON.parse(sessionStorage.getItem("__member_activation_debug") || "[]");
  } catch {
    return [];
  }
}

export function clearMemberDebugLogs() {
  try {
    sessionStorage.removeItem("__member_activation_debug");
  } catch (e) {}
}
