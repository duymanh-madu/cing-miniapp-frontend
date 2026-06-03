import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";

const PAGE_NAMES: Record<string, string> = {
  "/": "Trang chủ",
  "/menu": "Thực đơn",
  "/game": "Game Center",
  "/leaderboard": "Đại sảnh danh vọng",
  "/account": "Tài khoản",
  "/orders": "Lịch sử đơn",
  "/loyalty": "Điểm tích lũy",
  "/profile": "Hồ sơ",
  "/checkout": "Đặt hàng",
};

export function usePageTracking() {
  const location = useLocation();
  const phone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  useEffect(() => {
    const cleanPhone = (phone || "").replace(/\D/g,"").replace(/^84/,"0");
    if (!cleanPhone || cleanPhone === "pending" || cleanPhone.length < 9) return;
    
    const path = location.pathname;
    const pageName = Object.entries(PAGE_NAMES).find(([k]) => path.startsWith(k) && k !== "/")?.[1]
      || PAGE_NAMES[path] || path;

    const socket = getRuntimeSocket();
    if (socket?.connected) {
      socket.emit("user:page", { userId: cleanPhone, page: pageName, action: "" });
    }
  }, [location.pathname, phone]);
}
