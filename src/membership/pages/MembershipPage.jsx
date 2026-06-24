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
      .then(r => setPointsLog((r.data?.data || []).filter(item =>
        item.event_name === "points_added" || item.event_name === "points_deducted"
      )))
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
        const iposItems = (d.ipos?.logs || []).map(l => {
          // Phân tách đúng nguồn: APP_CINGHUTANG = qua app, còn lại = tại quán
          const isAppOrder = (l.channels || []).some(c => c.name === "APP_CINGHUTANG");
          return {
            id: l.id || l.tran_id,
            date: l.create_date || l.tran_date,
            amount: Number(l.amount || l.bill_amount || 0),
            type: "ipos",
            source: isAppOrder ? "app" : "ipos",
            label: isAppOrder ? "Đặt hàng qua App" : (l.note || l.type_name || "Giao dịch tại quán"),
            points: Math.round((Number(l.point_change || l.point || 0)) * 10) / 10,
          };
        });
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
                icon:"🛍",
                title:"Dùng điểm khi đặt hàng",
                desc:"1 điểm = 1.000đ. Dùng điểm trực tiếp khi thanh toán để giảm tiền đơn hàng.",
                action:"Đặt hàng ngay",
                path:"/menu",
                actionKey:"order_with_points",
                color:"#D4531C",
                bg:"#fff7f0",
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
              // Sau khi lọc, mọi item ở đây chỉ là points_added hoặc points_deducted
              const isAdd    = item.event_name === "points_added";
              const amt      = Math.abs(item.event_data?.amount || 0);
              const reason   = item.event_data?.reason || (isAdd ? "Nhận thưởng" : "Sử dụng");
              const newTotal = item.event_data?.new_total;
              const date     = new Date(item.created_at).toLocaleString("vi-VN", {
                day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"
              });
              const unit = "điểm";
              const icon = isAdd ? "⭐" : "💸";
              const bg   = isAdd ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)";
              return (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12,
                  padding:"10px 0", borderBottom: i < pointsLog.length-1 ? "1px solid #f5f5f5" : "none" }}>
                  <div style={{ width:38, height:38, borderRadius:12, flexShrink:0,
                    background: bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                    {icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", margin:"0 0 2px",
                      overflowWrap:"break-word", wordBreak:"break-word" }}>{reason}</p>
                    <p style={{ fontSize:11, color:"#999", margin:0 }}>
                      {date}
                      {newTotal !== undefined && (
                        <span style={{ marginLeft:6, color:"#bbb" }}>· Còn {Math.round(newTotal)} {unit}</span>
                      )}
                    </p>
                  </div>
                  <p style={{ fontSize:15, fontWeight:900, margin:0,
                    color: isAdd ? "#4CAF50" : "#f44336", flexShrink:0, whiteSpace:"nowrap" }}>
                    {isAdd ? "+" : "-"}{amt} {unit}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Modal đổi điểm lấy voucher */}
      {showExchange && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
          zIndex:9999, display:"flex", alignItems:"flex-end" }}
          onClick={() => { setShowExchange(false); setExchangeResult(null); }}>
          <div style={{ background:"white", borderRadius:"24px 24px 0 0", width:"100%",
            padding:"28px 24px 48px" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize:18, fontWeight:900, margin:"0 0 6px" }}>🎟 Đổi điểm lấy voucher</h2>
            <p style={{ fontSize:13, color:"#666", margin:"0 0 20px" }}>1 điểm = 1.000đ giảm giá</p>

            {exchangeResult ? (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <p style={{ fontSize:40 }}>🎉</p>
                <p style={{ fontSize:16, fontWeight:800, color:"#059669", margin:"8px 0 4px" }}>Đổi thành công!</p>
                <div style={{ background:"#f0fdf4", borderRadius:16, padding:"16px", margin:"16px 0" }}>
                  <p style={{ fontSize:12, color:"#666", margin:"0 0 6px" }}>Mã voucher của bạn</p>
                  <p style={{ fontSize:28, fontWeight:900, color:"#059669", letterSpacing:3, margin:"0 0 6px" }}>
                    {exchangeResult.voucher_code}
                  </p>
                  <p style={{ fontSize:13, color:"#333", margin:"0 0 4px" }}>
                    Giảm {new Intl.NumberFormat("vi-VN").format(exchangeResult.discount_amount)}đ
                  </p>
                  <p style={{ fontSize:11, color:"#999", margin:0 }}>HSD: {exchangeResult.date_end?.slice(0,10)}</p>
                </div>
                <p style={{ fontSize:12, color:"#666" }}>Dùng được cả online lẫn tại quán</p>
                <button onClick={() => { setShowExchange(false); setExchangeResult(null); }}
                  style={{ marginTop:16, width:"100%", padding:12, borderRadius:12, border:"none",
                    background:"#059669", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div style={{ background:"#f0fdf4", borderRadius:16, padding:"16px", marginBottom:20 }}>
                  <p style={{ fontSize:13, color:"#666", margin:"0 0 4px" }}>Bạn đang có</p>
                  <p style={{ fontSize:28, fontWeight:900, color:"#059669", margin:0 }}>
                    {points.toLocaleString("vi-VN")} điểm
                  </p>
                  <p style={{ fontSize:12, color:"#999", margin:"4px 0 0" }}>= {fmt(points * 1000)}</p>
                </div>

                <p style={{ fontSize:13, fontWeight:700, margin:"0 0 8px" }}>Nhập số điểm muốn đổi:</p>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <input
                    type="number" min={1} max={points}
                    value={exchangePoints}
                    onChange={e => {
                      const v = Math.max(1, Math.min(points, parseInt(e.target.value) || 1));
                      setExchangePoints(v);
                    }}
                    style={{ flex:1, border:"2px solid #059669", borderRadius:10, padding:"10px 12px",
                      fontSize:16, fontWeight:800, color:"#059669", outline:"none", textAlign:"center" }}
                  />
                  <button onClick={() => setExchangePoints(points)}
                    style={{ padding:"10px 14px", borderRadius:10, border:"none",
                      background:"#059669", color:"white", fontSize:12, fontWeight:800, cursor:"pointer" }}>
                    Tối đa
                  </button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                  {[10, 20, 50, 100, 200].filter(pt => pt <= points).map(pt => (
                    <button key={pt} onClick={() => setExchangePoints(pt)}
                      style={{ padding:"6px 12px", borderRadius:16,
                        border: exchangePoints === pt ? "2px solid #059669" : "1px solid #e0e0e0",
                        background: exchangePoints === pt ? "#f0fdf4" : "white",
                        color: exchangePoints === pt ? "#059669" : "#666",
                        fontWeight:700, fontSize:12, cursor:"pointer" }}>
                      {pt}đ
                    </button>
                  ))}
                </div>

                <div style={{ background:"#fff7ed", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
                  <p style={{ fontSize:13, margin:0, color:"#92400e" }}>
                    Đổi <strong>{exchangePoints} điểm</strong> → voucher giảm <strong>{new Intl.NumberFormat("vi-VN").format(exchangePoints * 1000)}đ</strong>
                    {points < exchangePoints && <span style={{ color:"#dc2626", display:"block", marginTop:4 }}>⚠️ Không đủ điểm</span>}
                  </p>
                </div>

                <button
                  disabled={exchanging || points < exchangePoints}
                  onClick={async () => {
                    setExchanging(true);
                    try {
                      const res = await apiClient.post("/points/exchange-voucher", {
                        user_id: phone, phone, points: exchangePoints,
                      });
                      if (res.data?.success) {
                        setExchangeResult(res.data);
                        setPoints(p => p - exchangePoints);
                      } else {
                        import("zmp-sdk").then(sdk => sdk.showToast?.({ text: res.data?.message || "Lỗi đổi voucher", duration: "long" }));
                      }
                    } catch(e) {
                      import("zmp-sdk").then(sdk => sdk.showToast?.({ text: "Lỗi kết nối", duration: "long" }));
                    }
                    setExchanging(false);
                  }}
                  style={{ width:"100%", padding:14, borderRadius:14, border:"none",
                    background: (exchanging || points < exchangePoints) ? "#e0e0e0" : "#059669",
                    color:"white", fontSize:15, fontWeight:900, cursor:"pointer" }}>
                  {exchanging ? "Đang xử lý..." : `Đổi ${exchangePoints} điểm ngay`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
