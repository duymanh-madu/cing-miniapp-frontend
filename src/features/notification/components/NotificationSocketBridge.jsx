import { useEffect } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

export default function NotificationSocketBridge() {
  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        const handler = (data) => {
          const notif = data?.payload?.notification || data?.notification || data;
          if (!notif?.title && !notif?.message) return;
          window.dispatchEvent(new CustomEvent("notification_received", { detail: notif }));
        };
        socket.on("notification.new", handler);
        socket.on("notification.broadcast", handler);
        socket.on("connect", () => { socket.off("notification.new", handler); socket.off("notification.broadcast", handler); attach(); });
        return;
      }
      if (attempts++ < 30) setTimeout(attach, 1000);
    };
    attach();
  }, []);
  return null;
}
