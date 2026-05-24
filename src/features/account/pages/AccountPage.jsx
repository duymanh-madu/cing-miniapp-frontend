import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";
import useCartStore from "@/features/menu/store/cartStore";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

const MENU_ITEMS = [
  { icon:"📦", label:"Lịch sử đơn hàng",   path:"/orders",      desc:"Xem các đơn đã đặt" },
  { icon:"🎟", label:"Voucher của tôi",     path:"/voucher",     desc:"Ưu đãi và mã giảm giá" },
  { icon:"⭐", label:"Điểm tích lũy",       path:"/loyalty",     desc:"Xem điểm và đổi quà" },
  { icon:"👑", label:"Đại Lộ Danh Vọng",   path:"/leaderboard", desc:"Bảng xếp hạng khách hàng" },
  { icon:"🎮", label:"Game Center",         path:"/game-center", desc:"Chơi game nhận thưởng" },
  { icon:"📞", label:"Liên hệ hỗ trợ",     path:null,           desc:"Hotline: 1900 xxxx" },
];

export default function AccountPage() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);
  const name = profile?.name || profile?.displayName || "Khách";
  const avatar = (name)[0]?.toUpperCase();

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:100 }}>

      {/* HEADER PROFILE */}
      <div style={{
        background:"linear-gradient(135deg,#D4531C,#E8622A)",
        padding:"32px 20px 24px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{
            width:72, height:72, borderRadius:36,
            background:"rgba(255,255,255,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, fontWeight:900, color:"white",
            border:"3px solid rgba(255,255,255,0.4)",
          }}>{avatar}</div>
          <div>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:"0 0 4px", fontWeight:600 }}>
              Xin chào 👋
            </p>
            <p style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 4px" }}>{name}</p>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:0 }}>
              {profile?.phone || "Thành viên Cing Hu Tang"}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          {[
            { label:"Điểm tích lũy", value: profile?.points || 0, unit:"đ" },
            { label:"Hạng thành viên", value: profile?.tier || "Đồng", unit:"" },
            { label:"Đơn hàng", value: profile?.totalOrders || 0, unit:"" },
          ].map((s,i) => (
            <div key={i} style={{
              flex:1, background:"rgba(255,255,255,0.15)",
              borderRadius:14, padding:"10px 8px", textAlign:"center",
              border:"1px solid rgba(255,255,255,0.2)",
            }}>
              <p style={{ color:"white", fontSize:16, fontWeight:900, margin:"0 0 2px" }}>
                {s.value}{s.unit}
              </p>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:10, margin:0, fontWeight:600 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ background:"white", borderRadius:20, overflow:"hidden",
          boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          {MENU_ITEMS.map((item, idx) => (
            <div key={idx}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"14px 16px",
                borderTop: idx > 0 ? "1px solid #f5f5f5" : "none",
                cursor: item.path ? "pointer" : "default",
              }}>
              <div style={{
                width:44, height:44, borderRadius:14, flexShrink:0,
                background:"#f5f5f5",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22,
              }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:"#1a1a1a", margin:"0 0 2px" }}>
                  {item.label}
                </p>
                <p style={{ fontSize:11, color:"#999", margin:0 }}>{item.desc}</p>
              </div>
              {item.path && (
                <span style={{ color:"#ccc", fontSize:18 }}>›</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* APP INFO */}
      <div style={{ padding:"20px 16px", textAlign:"center" }}>
        <p style={{ fontSize:12, color:"#ccc", margin:0 }}>Cing Hu Tang Kinh Bắc</p>
        <p style={{ fontSize:11, color:"#ddd", margin:"4px 0 0" }}>576 Đường Trần Phú, Từ Sơn, Bắc Ninh</p>
      </div>
    </div>
  );
}
