import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMembership } from "@/features/home/hooks/useMembership";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

export default function MembershipPage() {
  const [showExchange, setShowExchange] = useState(false);
  const [exchangePoints, setExchangePoints] = useState(50);
  const [exchanging, setExchanging] = useState(false);
  const [exchangeResult, setExchangeResult] = useState(null);
  const navigate = useNavigate();
  const profile  = useAuthStore(s => s.profile);
  const phone    = (profile?.phone || profile?.phoneNumber || "").replace(/\D/g, "");
  const { data: membership, isLoading } = useMembership(phone);

  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const resolvedPhone = (() => {
    const src = runtimePhone || profile?.phone || "";
    return src.replace(/\D/g,"").replace(/^84/,"0");
  })();

  const points    = membership?.points || 0;
  const tierName  = membership?.tierName || "Hội viên";
  const pointsVnd = points * 1000;

  const [history, setHistory]   = useState([]);
  const [pointsLog, setPointsLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("points");

  useEffect(() => {
    const p = resolvedPhone || phone;
    if (!p) return;
    setLogLoading(true);
    apiClient.get(`/profile-update/points-history/${p}`)
      .then(r => setPointsLog(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLogLoading(false));
  }, [resolvedPhone, phone]);

  useEffect(() => {
    const p = resolvedPhone || phone;
    if (!p) return;
    setHistLoading(true);
    apiClient.get(`/membership/${p}/transactions`)
      .then(r => {
        const d = r.data?.data;
        if (!d) return;
        // Merge app payments + ipos logs thành 1 danh sách điểm
        const appItems = (d.app?.payments || []).filter(p => p.payment_status === "paid").map(p => ({
          id: p.id,
          date: p.created_at,
          amount: Number(p.amount || 0),
          type: "payment",
          source: "app",
          method: p.payment_method,
          label: "Thanh toán đơn hàng (App)",
        }));
        const iposItems = (d.ipos?.logs || []).map(l => ({
          id: l.id || l.tran_id,
          date: l.create_date || l.tran_date,
          amount: Number(l.amount || l.bill_amount || 0),
          type: "ipos",
          source: "ipos",
          label: l.note || l.type_name || "Giao dịch tại quán",
          points: l.point_change || l.point || 0,
        }));
        const merged = [...appItems, ...iposItems]
          .sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
        setHistory(merged);
      })
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, [resolvedPhone, phone]);

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
                icon:"🎟",
                title:"Đổi điểm lấy voucher",
                desc:"1 điểm = 1.000đ giảm giá. Voucher dùng được cả online lẫn tại quán.",
                action:"Đổi ngay",
                path:null,
                actionKey:"exchange_voucher",
                color:"#059669",
                bg:"#f0fdf4",
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
                <button onClick={() => {
                  if (item.actionKey === "exchange_voucher") setShowExchange(true);
                  else if (item.path) navigate(item.path);
                }} style={{
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

          {/* LỊCH SỬ GIAO DỊCH */}
          <div style={{ background:"white", borderRadius:20, padding:"20px",
            marginTop:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:15, fontWeight:800, color:"#1a1a1a", margin:"0 0 12px" }}>
              📋 Lịch sử giao dịch
            </p>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {[
                { key:"points", label:"Tất cả" },
                { key:"app",    label:"Qua App" },
                { key:"ipos",   label:"Tại quán" },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  background: activeTab===t.key ? "#D4531C" : "#f5f5f5",
                  border:"none", borderRadius:20, padding:"6px 14px", cursor:"pointer",
                  color: activeTab===t.key ? "white" : "#666",
                  fontSize:12, fontWeight:700,
                }}>{t.label}</button>
              ))}
            </div>
            {histLoading ? (
              <p style={{ textAlign:"center", color:"#bbb", padding:"20px 0" }}>Đang tải...</p>
            ) : history.length === 0 ? (
              <p style={{ textAlign:"center", color:"#bbb", fontSize:13, padding:"20px 0" }}>
                Chưa có lịch sử giao dịch
              </p>
            ) : history
              .filter(item => activeTab === "points" || item.source === activeTab)
              .slice(0, 20)
              .map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                  padding:"10px 0", borderBottom:"1px solid #f5f5f5" }}>
                  <div style={{ width:38, height:38, borderRadius:12, flexShrink:0,
                    background: item.source==="app" ? "#f3e5f5" : "#e3f2fd",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                    {item.source === "app" ? "📱" : "🏪"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a",
                      margin:"0 0 2px", overflow:"hidden", whiteSpace:"nowrap",
                      textOverflow:"ellipsis" }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize:11, color:"#999", margin:0 }}>
                      {item.date ? new Date(item.date).toLocaleDateString("vi-VN", {
                        day:"2-digit", month:"2-digit", year:"numeric",
                        hour:"2-digit", minute:"2-digit"
                      }) : ""}
                      {item.source === "app" && (
                        <span style={{ marginLeft:6, fontSize:9, color:"#7B1FA2",
                          border:"1px solid #7B1FA2", borderRadius:4, padding:"1px 5px" }}>App</span>
                      )}
                      {item.source === "ipos" && (
                        <span style={{ marginLeft:6, fontSize:9, color:"#1565C0",
                          border:"1px solid #1565C0", borderRadius:4, padding:"1px 5px" }}>iPOS</span>
                      )}
                    </p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontSize:14, fontWeight:900,
                      color: item.points > 0 ? "#4CAF50" : "#D4531C",
                      margin:0 }}>
                      {item.points > 0 ? `+${item.points} điểm` : new Intl.NumberFormat("vi-VN").format(item.amount) + "đ"}
                    </p>
                  </div>
                </div>
              ))
            }
          </div>

          {/* LỊCH SỬ CỘNG/TRỪ ĐIỂM */}
          <div style={{ background:"white", borderRadius:20, padding:"20px",
            marginTop:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:15, fontWeight:800, color:"#1a1a1a", margin:"0 0 16px" }}>
              ⭐ Lịch sử điểm tích lũy
            </p>
            {logLoading ? (
              <p style={{ color:"#bbb", textAlign:"center", padding:"20px 0" }}>Đang tải...</p>
            ) : pointsLog.length === 0 ? (
              <p style={{ color:"#bbb", textAlign:"center", fontSize:13, padding:"20px 0" }}>Chưa có lịch sử điểm</p>
            ) : pointsLog.map((item, i) => {
              const isPoints = item.event_name === "points_added" || item.event_name === "points_deducted";
              const isPlays  = item.event_name === "plays_added"  || item.event_name === "plays_deducted";
              const isAdd    = item.event_name === "points_added" || item.event_name === "plays_added";
              const amt      = Math.abs(item.event_data?.amount || 0);
              const reason   = item.event_data?.reason || (isAdd ? "Nhận thưởng" : "Sử dụng");
              const newTotal = item.event_data?.new_total;
              const date     = new Date(item.created_at).toLocaleString("vi-VN", {
                day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"
              });
              const unit = isPlays ? "lượt" : "điểm";
              const icon = isPlays ? (isAdd ? "🎮" : "🕹️") : (isAdd ? "⭐" : "💸");
              const bg   = isAdd ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)";
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                  padding:"10px 0", borderBottom: i < pointsLog.length-1 ? "1px solid #f5f5f5" : "none" }}>
                  <div style={{ width:38, height:38, borderRadius:12, flexShrink:0,
                    background: bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                    {icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", margin:"0 0 2px",
                      overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{reason}</p>
                    <p style={{ fontSize:11, color:"#999", margin:0 }}>
                      {date}
                      {newTotal !== undefined && (
                        <span style={{ marginLeft:6, color:"#bbb" }}>· Còn {Math.round(newTotal)} {unit}</span>
                      )}
                    </p>
                  </div>
                  <p style={{ fontSize:15, fontWeight:900, margin:0,
                    color: isAdd ? "#4CAF50" : "#f44336", flexShrink:0 }}>
                    {isAdd ? "+" : "-"}{amt} {unit}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
