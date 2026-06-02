import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = n => new Intl.NumberFormat("vi-VN").format(n||0);

function MiniBar({ data, field, color, label }) {
  const max = Math.max(...data.map(d => d[field] || 0), 1);
  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:"16px 20px", border:"1px solid #2a2a38" }}>
      <p style={{ color:"#888", fontSize:11, fontWeight:700, margin:"0 0 12px", letterSpacing:1 }}>{label}</p>
      <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:60 }}>
        {data.map((d, i) => {
          const h = Math.round((d[field]||0) / max * 100);
          const isToday = i === data.length - 1;
          return (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:"100%", height: h ? `${h}%` : 2, minHeight:2,
                background: isToday ? color : color+"66",
                borderRadius:"3px 3px 0 0", transition:"height 0.3s" }}/>
              <span style={{ fontSize:8, color: isToday?"white":"#444", whiteSpace:"nowrap" }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ color:"white", fontSize:22, fontWeight:900, margin:"10px 0 0" }}>
        {field === "revenue" ? fmt(data[data.length-1]?.[field]||0)+"đ" : fmt(data[data.length-1]?.[field]||0)}
        <span style={{ color:"#555", fontSize:12, fontWeight:400, marginLeft:6 }}>hôm nay</span>
      </p>
    </div>
  );
}

export default function AdminStats({ token }) {
  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/admin/stats",         { headers:h }).then(r => setStats(r.data?.data)).catch(()=>{});
    apiClient.get("/admin/stats/history", { headers:h }).then(r => setHistory(r.data?.data||[])).catch(()=>{});
  }, []);

  const cards = [
    { label:"Tổng thành viên", value: fmt(stats?.total_players), icon:"👥", color:"#4CAF50" },
    { label:"Đơn hàng hôm nay", value: fmt(stats?.orders_today), icon:"🛍", color:"#2196F3" },
    { label:"Lượt chơi game", value: fmt(stats?.games_total), icon:"🎮", color:"#FF9800" },
    { label:"Doanh thu hôm nay", value: fmt(stats?.revenue_today)+"đ", icon:"💰", color:"#D4531C" },
  ];

  return (
    <div>
      <h2 style={{ color:"white", fontSize:18, fontWeight:900, margin:"0 0 16px" }}>📊 Tổng quan hệ thống</h2>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:20 }}>
        {cards.map((c,i) => (
          <div key={i} style={{ background:"#1a1a24", borderRadius:14, padding:"16px",
            border:`1px solid ${c.color}30` }}>
            <p style={{ color:"#666", fontSize:11, margin:"0 0 6px" }}>{c.icon} {c.label}</p>
            <p style={{ color:"white", fontSize:22, fontWeight:900, margin:0 }}>{c.value||0}</p>
          </div>
        ))}
      </div>

      {/* Charts 7 ngày */}
      {history.length > 0 && (
        <>
          <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:2, margin:"0 0 12px", textTransform:"uppercase" }}>
            📈 7 ngày gần nhất
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:20 }}>
            <MiniBar data={history} field="orders"      color="#2196F3" label="🛍 Đơn hàng / ngày" />
            <MiniBar data={history} field="revenue"     color="#D4531C" label="💰 Doanh thu / ngày" />
            <MiniBar data={history} field="games"       color="#FF9800" label="🎮 Lượt chơi game / ngày" />
            <MiniBar data={history} field="new_players" color="#4CAF50" label="👥 Thành viên mới / ngày" />
          </div>

          {/* Table chi tiết */}
          <div style={{ background:"#1a1a24", borderRadius:16, overflow:"hidden", border:"1px solid #2a2a38" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#0d0d18" }}>
                  {["Ngày","Đơn hàng","Doanh thu","Lượt game","Thành viên mới"].map(h => (
                    <th key={h} style={{ padding:"10px 12px", color:"#555", fontSize:10,
                      fontWeight:700, textAlign:"left", letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((d, i) => (
                  <tr key={i} style={{ borderTop:"1px solid #2a2a38",
                    background: i===0 ? "rgba(212,83,28,0.05)" : "transparent" }}>
                    <td style={{ padding:"10px 12px", color: i===0?"#FFD700":"#aaa", fontSize:12, fontWeight: i===0?700:400 }}>
                      {d.label} {i===0?"(hôm nay)":""}
                    </td>
                    <td style={{ padding:"10px 12px", color:"white", fontSize:12 }}>{fmt(d.orders)}</td>
                    <td style={{ padding:"10px 12px", color:"white", fontSize:12 }}>{fmt(d.revenue)}đ</td>
                    <td style={{ padding:"10px 12px", color:"white", fontSize:12 }}>{fmt(d.games)}</td>
                    <td style={{ padding:"10px 12px", color:"white", fontSize:12 }}>{fmt(d.new_players)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
