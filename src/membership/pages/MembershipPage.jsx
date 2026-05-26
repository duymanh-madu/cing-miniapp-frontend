import { useNavigate } from "react-router-dom";
import { useMembership } from "@/features/home/hooks/useMembership";
import useAuthStore from "@/stores/auth/authStore";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

export default function MembershipPage() {
  const navigate = useNavigate();
  const profile  = useAuthStore(s => s.profile);
  const phone    = (profile?.phone || profile?.phoneNumber || "").replace(/\D/g, "");
  const { data: membership, isLoading } = useMembership(phone);

  const points    = membership?.points || 0;
  const tierName  = membership?.tierName || "Hội viên";
  const pointsVnd = points * 1000;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:80 }}>

      {/* Header */}
      <div style={{ background:"white", padding:"14px 16px",
        display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)}
          style={{ background:"none", border:"none", fontSize:22, cursor:"pointer" }}>←</button>
        <h1 style={{ fontSize:18, fontWeight:900, margin:0 }}>⭐ Điểm tích lũy</h1>
      </div>

      {isLoading ? (
        <div style={{ padding:"80px 24px", textAlign:"center", color:"#bbb" }}>
          <p style={{ fontSize:40, margin:"0 0 12px" }}>⏳</p>
          <p style={{ fontSize:14 }}>Đang tải điểm của bạn...</p>
        </div>
      ) : (
        <div style={{ padding:"16px" }}>

          {/* ĐIỂM HIỆN TẠI */}
          <div style={{
            background:"linear-gradient(135deg,#D4531C,#E8622A)",
            borderRadius:24, padding:"28px 24px", marginBottom:16,
            textAlign:"center", color:"white",
            boxShadow:"0 8px 32px rgba(212,83,28,0.35)",
          }}>
            <p style={{ fontSize:12, opacity:0.8, margin:"0 0 8px",
              letterSpacing:2, fontWeight:600, textTransform:"uppercase" }}>
              Điểm tích lũy của bạn
            </p>
            <p style={{ fontSize:72, fontWeight:900, margin:"0 0 4px", lineHeight:1 }}>
              {points.toLocaleString("vi-VN")}
            </p>
            <p style={{ fontSize:14, opacity:0.8, margin:"0 0 20px" }}>điểm</p>

            {/* Giá trị quy đổi */}
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:14,
              padding:"12px 16px", display:"inline-block" }}>
              <p style={{ fontSize:13, opacity:0.85, margin:"0 0 2px" }}>
                Tương đương
              </p>
              <p style={{ fontSize:20, fontWeight:900, margin:0 }}>
                {fmt(pointsVnd)}
              </p>
            </div>

            <p style={{ fontSize:11, opacity:0.6, margin:"12px 0 0" }}>
              Hạng: {tierName} · 1 điểm = 1.000đ
            </p>
          </div>

          {/* HƯỚNG DẪN SỬ DỤNG */}
          <div style={{ background:"white", borderRadius:20, padding:"20px",
            marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:15, fontWeight:800, color:"#1a1a1a", margin:"0 0 16px" }}>
              Dùng điểm để làm gì?
            </p>

            {[
              {
                icon:"🧋",
                title:"Thanh toán đơn hàng",
                desc:"Dùng điểm để giảm trực tiếp vào hoá đơn khi đặt đồ. 1 điểm = giảm 1.000đ.",
                action:"Đặt đồ ngay",
                path:"/menu",
                color:"#D4531C",
                bg:"#fff7ed",
              },
              {
                icon:"🎮",
                title:"Mua lượt chơi game",
                desc:"Dùng 5 điểm để đổi lấy 1 lượt chơi game. Leo rank và nhận thưởng hấp dẫn.",
                action:"Vào Game Center",
                path:"/game-center",
                color:"#7c3aed",
                bg:"#f5f3ff",
              },
            ].map((item, i) => (
              <div key={i} style={{
                background:item.bg, borderRadius:16, padding:"16px",
                marginBottom: i === 0 ? 12 : 0,
              }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:12 }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:800, color:"#1a1a1a", margin:"0 0 4px" }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize:12, color:"#666", margin:0, lineHeight:1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                <button onClick={() => navigate(item.path)} style={{
                  width:"100%", padding:"11px", borderRadius:12, border:"none",
                  background:item.color, color:"white",
                  fontSize:13, fontWeight:800, cursor:"pointer",
                }}>
                  {item.action} →
                </button>
              </div>
            ))}
          </div>

          {/* CÁCH TÍCH ĐIỂM */}
          <div style={{ background:"white", borderRadius:20, padding:"20px",
            boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:15, fontWeight:800, color:"#1a1a1a", margin:"0 0 16px" }}>
              Cách tích điểm
            </p>
            {[
              { icon:"🧋", title:"Đặt hàng qua app",   desc:"Tự động tích sau khi thanh toán thành công" },
              { icon:"🏪", title:"Mua tại quán",        desc:"Báo số điện thoại khi thanh toán tại quầy" },
              { icon:"🎯", title:"Hoàn thành nhiệm vụ", desc:"Nhận điểm thưởng từ các thử thách hàng ngày" },
            ].map((item, i) => (
              <div key={i} style={{
                display:"flex", gap:12, alignItems:"center",
                padding:"10px 0",
                borderBottom: i < 2 ? "1px solid #f5f5f5" : "none",
              }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", margin:"0 0 2px" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize:11, color:"#999", margin:0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
