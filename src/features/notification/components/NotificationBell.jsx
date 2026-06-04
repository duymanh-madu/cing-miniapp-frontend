import { useState, useEffect, useRef } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket && socket.connected) {
socket.on("notification.new", (data) => {
const notif = data?.payload?.notification || data?.notification || data;
          if (!notif) return;
          setNotifications(prev => [notif, ...prev].slice(0, 20));
          setUnread(u => u + 1);
        });
        socket.on("notification.broadcast", (data) => {
const notif = data?.payload?.notification || data?.notification || data;
          if (!notif) return;
          setNotifications(prev => [notif, ...prev].slice(0, 20));
          setUnread(u => u + 1);
        });
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };
    attach();
    return () => {
      const s = getRuntimeSocket();
      if (s) { s.off("notification.new"); s.off("notification.broadcast"); s.off("menu.updated"); s.off("menu.item_out_of_stock"); }
    };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative", zIndex:999 }}>
      <button onClick={() => { setOpen(o => !o); setUnread(0); }}
        style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%",
          width:44, height:44, cursor:"pointer", position:"relative",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
        🔔
        {unread > 0 && (
          <span style={{ position:"absolute", top:-2, right:-2, background:"#ff4444",
            color:"white", borderRadius:"50%", width:18, height:18, fontSize:10,
            fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position:"fixed", top:100, left:"50%", transform:"translateX(-50%)", width:"85vw", maxWidth:340,
          background:"rgba(255,255,255,0.2)", backdropFilter:"blur(16px)",
          WebkitBackdropFilter:"blur(16px)",
          borderRadius:20, boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
          zIndex:9999, maxHeight:400, overflowY:"auto",
          border:"1px solid rgba(255,255,255,0.6)" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0",
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontWeight:800, fontSize:14, margin:0 }}>Thông báo</p>
            {notifications.length > 0 && (
              <button onClick={() => setNotifications([])}
                style={{ fontSize:11, color:"#999", background:"none", border:"none", cursor:"pointer" }}>
                Xóa tất cả
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding:"24px 16px", textAlign:"center", color:"#333" }}>
              <p style={{ fontSize:32, margin:"0 0 8px" }}>🔔</p>
              <p style={{ fontSize:13, margin:0 }}>Chưa có thông báo nào</p>
            </div>
          ) : notifications.map((n, i) => (
            <div key={i} style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5",
              background: i === 0 ? "#fff8f5" : "white" }}>
              <p style={{ fontWeight:700, fontSize:13, margin:"0 0 2px", color:"#1a1a1a" }}>{n.title}</p>
              <p style={{ fontSize:12, color:"#888", margin:"0 0 4px" }}>{n.message}</p>
              <p style={{ fontSize:10, color:"#bbb", margin:0 }}>
                {new Date(n.created_at).toLocaleTimeString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
