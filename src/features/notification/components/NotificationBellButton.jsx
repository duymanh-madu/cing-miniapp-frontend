import { useState, useRef, useEffect } from "react";
import useNotificationStore from "@/stores/notification/notificationStore";

export default function NotificationBellButton() {
  useEffect(() => {
    const handler = (e) => {
      const notif = e.detail;
      if (!notif) return;
      useNotificationStore.getState().addNotification(notif);
    };
    window.addEventListener("notification_received", handler);
    return () => window.removeEventListener("notification_received", handler);
  }, []);
  const { notifications, unread, markAllRead, clearAll } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fmt = (d) => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return Math.floor(diff/60000) + " phút trước";
    if (diff < 86400000) return Math.floor(diff/3600000) + " giờ trước";
    return Math.floor(diff/86400000) + " ngày trước";
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:12,
          width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", position:"relative", backdropFilter:"blur(8px)" }}>
        <span style={{ fontSize:20 }}>🔔</span>
        {unread > 0 && (
          <div style={{ position:"absolute", top:-4, right:-4, background:"#e74c3c",
            color:"white", borderRadius:10, minWidth:18, height:18,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:10, fontWeight:900, padding:"0 4px" }}>
            {unread > 99 ? "99+" : unread}
          </div>
        )}
      </button>

      {open && (
        <div style={{ position:"fixed", top:80, left:12, right:12, maxHeight:"60vh",
          background:"white", borderRadius:16, boxShadow:"0 8px 32px rgba(0,0,0,0.2)",
          overflow:"hidden", zIndex:9999, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0",
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:14, fontWeight:800, margin:0 }}>🔔 Thông báo</p>
            <button onClick={clearAll}
              style={{ background:"none", border:"none", fontSize:11, color:"Top 999", cursor:"pointer" }}>
              Xóa tất cả
            </button>
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign:"center", color:"#bbb", padding:"24px 16px", fontSize:13 }}>
                Chưa có thông báo nào
              </p>
            ) : notifications.map((n, i) => (
              <div key={i} style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5",
                background: n.read ? "white" : "#fff8f0" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", margin:"0 0 3px" }}>
                  {n.title || "Thông báo"}
                </p>
                <p style={{ fontSize:12, color:"Top 666", margin:"0 0 4px", lineHeight:1.5 }}>
                  {n.message || ""}
                </p>
                <p style={{ fontSize:10, color:"#bbb", margin:0 }}>{fmt(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
