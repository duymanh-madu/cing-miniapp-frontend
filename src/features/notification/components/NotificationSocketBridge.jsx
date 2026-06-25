import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";

export default function NotificationSocketBridge() {
  const phone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const [popup, setPopup] = useState(null);

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

          import("@/stores/notification/notificationStore").then(({ default: store }) => {
            store.getState().addNotification(notif);
          });

          const popupTypes = new Set([
            "payment_success",
            "after_hours_order",
            "points_added",
            "plays_added",
            "mission_completed",
            "CAMPAIGN_BROADCAST",
            "MISSION_COMPLETED",
          ]);

          const shouldPopup =
            notif?.popup === true ||
            data?.payload?.popup ||
            popupTypes.has(notif?.type) ||
            popupTypes.has(notif?.template_key);

          if (shouldPopup) {
            setPopup({
              title: notif.title || "Thông báo",
              message: notif.message || "",
              created_at: notif.created_at || new Date().toISOString(),
            });
            setTimeout(() => setPopup(null), 6500);
          }
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
  return popup ? createPortal(
    <div
      onClick={() => setPopup(null)}
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        top: "calc(env(safe-area-inset-top, 0px) + 74px)",
        zIndex: 100000,
        borderRadius: 18,
        padding: "14px 16px",
        background: "linear-gradient(135deg,#1b1208,#2a1400)",
        border: "1px solid rgba(255,215,0,0.35)",
        boxShadow: "0 14px 42px rgba(0,0,0,0.45)",
        color: "white",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4, color: "#FFD700" }}>
        {popup.title}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
        {popup.message}
      </div>
    </div>,
    document.body
  ) : null;
}
