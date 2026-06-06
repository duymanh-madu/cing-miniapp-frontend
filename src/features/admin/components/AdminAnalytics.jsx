import { useState, useEffect, useCallback } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = n => new Intl.NumberFormat("vi-VN").format(n || 0);
const fmtM = n => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return fmt(n);
};

function MiniBarChart({ data, valueKey, labelKey, color, height = 80 }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height }}>
      {data.map((d, i) => {
        const h = Math.round((d[valueKey] || 0) / max * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", gap:2, height:"100%" }}>
            <div style={{ flex:1, display:"flex", alignItems:"flex-end", width:"100%" }}>
              <div style={{ width:"100%", height: h ? `${h}%` : 2, minHeight:2,
                background: isLast ? color : color + "88",
                borderRadius:"2px 2px 0 0", transition:"height 0.3s" }}/>
            </div>
            {data.length <= 24 && (
              <span style={{ fontSize:7, color: isLast?"white":"Top 444", whiteSpace:"nowrap",
                transform:"rotate(-45deg)", transformOrigin:"center" }}>
                {d[labelKey]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KPICard({ label, current, previous, pct, color, icon, isMoney }) {
  const up = pct >= 0;
  return (
    <div style={{ background:"#1a1a24", borderRadius:14, padding:"16px 18px",
      border:`1px solid ${color}22` }}>
      <p style={{ color:"Top 666", fontSize:11, margin:"0 0 8px" }}>{icon} {label}</p>
      <p style={{ color:"white", fontSize:22, fontWeight:900, margin:"0 0 6px" }}>
        {isMoney ? fmtM(current) + "đ" : fmt(current)}
      </p>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ background: up?"rgba(76,175,80,0.15)":"rgba(244,67,54,0.15)",
          color: up?"#4CAF50":"#f44336",
          borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
          {up ? "▲" : "▼"} {Math.abs(pct)}%
        </span>
        <span style={{ color:"Top 555", fontSize:10 }}>so kỳ trước ({isMoney ? fmtM(previous)+"đ" : fmt(previous)})</span>
      </div>
    </div>
  );
}

const PERIODS = [
  { label:"7 ngày",  days:7  },
  { label:"30 ngày", days:30 },
  { label:"90 ngày", days:90 },
];

const PAYMENT_METHOD_LABELS = {
  momo:          { label:"MoMo",           icon:"💜" },
  bank_transfer: { label:"Chuyển khoản",   icon:"🏦" },
  cash:          { label:"Tiền mặt",       icon:"💵" },
  points:        { label:"Đổi điểm",       icon:"⭐" },
};

export default function AdminAnalytics({ token }) {
  const [period, setPeriod]         = useState(30);
  const [kpi, setKpi]               = useState(null);
  const [revenueDay, setRevenueDay] = useState([]);
  const [revenueHour, setRevenueHour] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [funnel, setFunnel]         = useState([]);
  const [payMethods, setPayMethods] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeChart, setActiveChart] = useState("revenue");
  const h = { Authorization: `Bearer ${token}` };

  const load = useCallback(async (days) => {
    setLoading(true);
    try {
      const [kpiRes, dayRes, hourRes, prodRes, funnelRes, pmRes] = await Promise.all([
        apiClient.get(`/admin/analytics/summary-kpi?days=${days}`, { headers:h }),
        apiClient.get(`/admin/analytics/revenue-by-day?days=${days}`, { headers:h }),
        apiClient.get("/admin/analytics/revenue-by-hour", { headers:h }),
        apiClient.get(`/admin/analytics/top-products?days=${days}`, { headers:h }),
        apiClient.get(`/admin/analytics/funnel?days=${days}`, { headers:h }),
        apiClient.get(`/admin/analytics/payment-methods?days=${days}`, { headers:h }),
      ]);
      setKpi(kpiRes.data?.data);
      setRevenueDay(dayRes.data?.data || []);
      setRevenueHour(hourRes.data?.data || []);
      setTopProducts(prodRes.data?.data || []);
      setFunnel(funnelRes.data?.data || []);
      setPayMethods(pmRes.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(period); }, [period]);

  const maxFunnel = Math.max(...funnel.map(f => f.value), 1);

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>📊 Analytics nâng cao</h2>
        <div style={{ display:"flex", gap:6 }}>
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => setPeriod(p.days)} style={{
              background: period===p.days ? "#D4531C" : "rgba(255,255,255,0.07)",
              border:"none", borderRadius:20, padding:"6px 14px", cursor:"pointer",
              color: period===p.days ? "white" : "#aaa", fontSize:12, fontWeight:700,
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color:"Top 666", textAlign:"center", padding:60 }}>Đang tải dữ liệu...</p>
      ) : (<>

        {/* KPI Cards */}
        {kpi && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
            <KPICard label="Đơn hàng" current={kpi.orders.current} previous={kpi.orders.previous}
              pct={kpi.orders.pct} color="#2196F3" icon="🛍" isMoney={false}/>
            <KPICard label="Doanh thu" current={kpi.revenue.current} previous={kpi.revenue.previous}
              pct={kpi.revenue.pct} color="#D4531C" icon="💰" isMoney={true}/>
            <KPICard label="Thành viên mới" current={kpi.newPlayers.current} previous={kpi.newPlayers.previous}
              pct={kpi.newPlayers.pct} color="#4CAF50" icon="👥" isMoney={false}/>
          </div>
        )}

        {/* Chart selector */}
        <div style={{ display:"flex", gap:6, marginBottom:16 }}>
          {[
            { key:"revenue",  label:"💰 Doanh thu theo ngày" },
            { key:"hour",     label:"🕐 Theo giờ hôm nay" },
            { key:"orders",   label:"🛍 Đơn hàng theo ngày" },
          ].map(c => (
            <button key={c.key} onClick={() => setActiveChart(c.key)} style={{
              background: activeChart===c.key ? "rgba(212,83,28,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${activeChart===c.key ? "#D4531C" : "#2a2a38"}`,
              color: activeChart===c.key ? "#D4531C" : "Top 888",
              borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer",
            }}>{c.label}</button>
          ))}
        </div>

        {/* Charts */}
        <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
          marginBottom:20, border:"1px solid #2a2a38" }}>
          {activeChart === "revenue" && revenueDay.length > 0 && (
            <>
              <p style={{ color:"Top 888", fontSize:11, fontWeight:700, margin:"0 0 16px", letterSpacing:1 }}>
                💰 DOANH THU {period} NGÀY GẦN NHẤT
              </p>
              <MiniBarChart data={revenueDay} valueKey="revenue" labelKey="label" color="#D4531C" height={120}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <span style={{ color:"Top 555", fontSize:11 }}>
                  Tổng: {fmtM(revenueDay.reduce((s,d)=>s+d.revenue,0))}đ
                </span>
                <span style={{ color:"Top 555", fontSize:11 }}>
                  Trung bình/ngày: {fmtM(Math.round(revenueDay.reduce((s,d)=>s+d.revenue,0)/revenueDay.length))}đ
                </span>
              </div>
            </>
          )}

          {activeChart === "hour" && revenueHour.length > 0 && (
            <>
              <p style={{ color:"Top 888", fontSize:11, fontWeight:700, margin:"0 0 16px", letterSpacing:1 }}>
                🕐 DOANH THU THEO GIỜ HÔM NAY
              </p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:120 }}>
                {revenueHour.map((d, i) => {
                  const max = Math.max(...revenueHour.map(x=>x.revenue), 1);
                  const h24 = new Date().getHours();
                  const isCur = i === h24;
                  return (
                    <div key={i} title={`${i}h: ${fmt(d.revenue)}đ`}
                      style={{ flex:1, display:"flex", flexDirection:"column",
                        alignItems:"center", gap:2, height:"100%" }}>
                      <div style={{ flex:1, display:"flex", alignItems:"flex-end", width:"100%" }}>
                        <div style={{ width:"100%",
                          height: d.revenue ? `${Math.round(d.revenue/max*100)}%` : 2,
                          minHeight:2,
                          background: isCur ? "#FFD700" : d.revenue > 0 ? "#D4531C" : "#2a2a38",
                          borderRadius:"2px 2px 0 0" }}/>
                      </div>
                      {i % 4 === 0 && (
                        <span style={{ fontSize:8, color:"Top 444" }}>{i}h</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p style={{ color:"Top 555", fontSize:11, margin:"10px 0 0" }}>
                Giờ cao điểm: {revenueHour.reduce((m,d,i) => d.revenue>revenueHour[m].revenue?i:m, 0)}h —
                Doanh thu: {fmtM(Math.max(...revenueHour.map(d=>d.revenue)))}đ
              </p>
            </>
          )}

          {activeChart === "orders" && revenueDay.length > 0 && (
            <>
              <p style={{ color:"Top 888", fontSize:11, fontWeight:700, margin:"0 0 16px", letterSpacing:1 }}>
                🛍 ĐƠN HÀNG {period} NGÀY GẦN NHẤT
              </p>
              <MiniBarChart data={revenueDay} valueKey="orders" labelKey="label" color="#2196F3" height={120}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <span style={{ color:"Top 555", fontSize:11 }}>
                  Tổng: {fmt(revenueDay.reduce((s,d)=>s+d.orders,0))} đơn
                </span>
                <span style={{ color:"Top 555", fontSize:11 }}>
                  Trung bình/ngày: {(revenueDay.reduce((s,d)=>s+d.orders,0)/revenueDay.length).toFixed(1)} đơn
                </span>
              </div>
            </>
          )}
        </div>

        {/* Funnel + Payment Methods */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>

          {/* Funnel */}
          <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
            <p style={{ color:"Top 888", fontSize:11, fontWeight:700, margin:"0 0 16px", letterSpacing:1 }}>
              🔽 FUNNEL CHUYỂN ĐỔI
            </p>
            {funnel.map((f, i) => {
              const pct = Math.round(f.value / maxFunnel * 100);
              const convRate = i > 0 && funnel[i-1].value > 0
                ? Math.round(f.value / funnel[i-1].value * 100) : 100;
              return (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:"white", fontSize:12, fontWeight:600 }}>{f.label}</span>
                    <span style={{ color:f.color, fontSize:12, fontWeight:800 }}>{fmt(f.value)}</span>
                  </div>
                  <div style={{ background:"#2a2a38", borderRadius:4, height:8 }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:f.color,
                      borderRadius:4, transition:"width 0.5s" }}/>
                  </div>
                  {i > 0 && (
                    <p style={{ color:"Top 555", fontSize:10, margin:"3px 0 0", textAlign:"right" }}>
                      Tỷ lệ chuyển đổi: {convRate}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Methods */}
          <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
            <p style={{ color:"Top 888", fontSize:11, fontWeight:700, margin:"0 0 16px", letterSpacing:1 }}>
              💳 PHƯƠNG THỨC THANH TOÁN
            </p>
            {payMethods.length === 0 ? (
              <p style={{ color:"Top 555", fontSize:13 }}>Chưa có dữ liệu</p>
            ) : payMethods.map((m, i) => {
              const info = PAYMENT_METHOD_LABELS[m.method] || { label: m.method, icon:"💳" };
              const totalRev = payMethods.reduce((s,x)=>s+x.revenue,0);
              const pct = totalRev > 0 ? Math.round(m.revenue/totalRev*100) : 0;
              return (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:"white", fontSize:12 }}>{info.icon} {info.label}</span>
                    <span style={{ color:"#FFD700", fontSize:12, fontWeight:700 }}>{pct}%</span>
                  </div>
                  <div style={{ background:"#2a2a38", borderRadius:4, height:6 }}>
                    <div style={{ width:`${pct}%`, height:"100%",
                      background: i===0?"#D4531C":i===1?"#2196F3":i===2?"#4CAF50":"#9C27B0",
                      borderRadius:4 }}/>
                  </div>
                  <p style={{ color:"Top 555", fontSize:10, margin:"3px 0 0" }}>
                    {fmt(m.count)} giao dịch · {fmtM(m.revenue)}đ
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
          <p style={{ color:"Top 888", fontSize:11, fontWeight:700, margin:"0 0 16px", letterSpacing:1 }}>
            🏆 MÓN BÁN CHẠY NHẤT ({period} ngày)
          </p>
          {topProducts.length === 0 ? (
            <p style={{ color:"Top 555", fontSize:13 }}>Chưa có dữ liệu</p>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {topProducts.slice(0, 10).map((p, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                  background:"#12121a", borderRadius:10, padding:"10px 12px" }}>
                  <span style={{ color: i<3?"#FFD700":"Top 555", fontSize:13,
                    fontWeight:800, width:24, textAlign:"center" }}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:"white", fontSize:12, fontWeight:700, margin:0,
                      overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                      {p.name}
                    </p>
                    <p style={{ color:"Top 555", fontSize:10, margin:0 }}>
                      {fmt(p.quantity)} phần · {fmtM(p.revenue)}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </>)}
    </div>
  );
}
