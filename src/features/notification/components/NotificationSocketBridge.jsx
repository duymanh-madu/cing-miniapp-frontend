import { useEffect } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";

export default function NotificationSocketBridge() {
  const phone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  // Fetch DB notifications khi user login — dù offline vẫn nhận được
  useEffect(() => {
    if (!phone) return;
    const p = phone.replace(/\D/g,"").replace(/^84/,"0");
    if (!p || p.length < 9) return;
    apiClient.get(`/profile-update/notifications/${p}`)
      .then(res => {
        const notifs = res.data?.data || [];
        if (!notifs.length) return;
        import("@/stores/notification/notificationStore").then(({ default: store }) => {
          notifs.forEach(n => store.getState().addNotification({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            created_at: n.created_at,
            data: n.metadata,
          }));
        });
        // Mark read sau 3s
        setTimeout(() => {
          apiClient.post("/profile-update/notifications/mark-read", {
            userId: p, ids: notifs.map(n => n.id)
          }).catch(() => {});
        }, 3000);
      })
      .catch(() => {});
  }, [phone]);

  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        const handler = (data) => {
          const notif = data?.payload?.notification || data?.notification || data;
          if (!notif?.title && !notif?.message) return;
          // Ghi thẳng vào store — không cần component listener
          import("@/stores/notification/notificationStore").then(({ default: store }) => {
            store.getState().addNotification(notif);
          });
        };
        socket.on("notification.new", handler);
        socket.on("notification.broadcast", handler);
        socket.on("notification:new", (data) => {
          // Gift notification realtime
          const myPhone = useRuntimeCustomerIdentityStore.getState().identity?.phone?.replace(/\D/g,"")?.replace(/^84/,"0");
          if (data?.userId && data.userId !== myPhone) return;
          import("@/stores/notification/notificationStore").then(({ default: store }) => {
            store.getState().addNotification({
              title: data.title, message: data.body,
              type: data.type || "gift_received", created_at: new Date().toISOString(),
            });
          });
        });
        socket.on("connect", () => {
          socket.off("notification.new", handler);
          socket.off("notification.broadcast", handler);
          socket.off("notification:new");
          attach();
        });
        return;
      }
      if (attempts++ < 30) setTimeout(attach, 1000);
    };
    attach();
  }, []);
  return null;
}
