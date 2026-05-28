import { useState, useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt  = p => new Intl.NumberFormat("vi-VN").format(p||0);
const fmtD = str => {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"2-digit"})
    + " " + d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
};

const TABS = [
  { key:"all",          label:"Tất cả",          icon:"📋" },
  { key:"orders",       label:"Đơn hàng",         icon:"🛍" },
  { key:"payments",     label:"Thanh toán",        icon:"💳" },
  { key:"games",        label:"Game scores",       icon:"🎮" },
  { key:"points",       label:"Điểm tích lũy",     icon:"⭐" },
  { key:"plays_bought", label:"Mua lượt chơi",     icon:"🎯" },
  { key:"plays_earned", label:"Lượt chơi từ ĐH",   icon:"🎁" },
  { key:"plays_given",  label:"Tặng lượt chơi",    icon:"🎀" },
  { key:"profile_changes", label:"Đổi thông tin",  icon:"✏️" },
];

export default function AdminLogs({ token }) {
  const [tab, setTab]         = useState("all");
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const timerRef = useRef(null);
  const h = { Authorization: `Bearer ${token}` };

  const fetchLogs = async (t = tab, p = page) => {
    setLoading(true);
    try {
      let url = `/admin/logs?filter=${t}&page=${p}&limit=50`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await apiClient.get(url, { headers: h });
      setLogs(res.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(tab, 1); setPage(1); }, [tab]);
  useEffect(() => {
    if (autoRefresh) { timerRef.current = setInterval(()=>fetchLogs(tab,1), 10000); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, tab]);

  const getColor = (item) => {
    if (item._type==="order")   return { color:"#1565C0", bg:"rgba(21,101,192,0.1)", icon:"🛍" };
    if (item._type==="payment") return { color:"#2E7D32", bg:"rgba(46,125,50,0.1)",  icon:"💳" };
    if (item._type==="game")    return { color:"#7c3aed", bg:"rgba(124,58,237,0.1)", icon:"🎮" };
    if (item._type==="points")  return { color:"#FFD700", bg:"rgba(255,215,0,0.1)",  icon:"⭐" };
    if (item._type==="plays_bought")  return { color:"#FF9800", bg:"rgba(255,152,0,0.1)", icon:"🎯" };
    if (item._type==="plays_earned")  return { color:"#4CAF50", bg:"rgba(76,175,80,0.1)", icon:"🎁" };
    if (item._type==="plays_given")   return { color:"#e879f9", bg:"rgba(232,121,249,0.1)", icon:"🎀" };
    if (item._type==="profile_change") return { color:"#60a5fa", bg:"rgba(96,165,250,0.1)", icon:"✏️" };
    return { color:"#888", bg:"rgba(255,255,255,0.05)", icon:"📋" };
  };

  const getTitle = (item) => {
    if (item._type==="order")    return `${item.customer_name||"Khách"} — ${fmt(item.total_amount)}đ`;
    if (item._type==="game")     return `${item.player_name||item.user_id} — ${fmt(item.score)} điểm (${item.game_key})`;
    if (item._type==="payment")  return `${item.customer_name||item.user_id} — ${fmt(item.amount)}đ`;
    if (item._type==="points")   return `${item.user_id} — ${item.amount>0?"+":""}${fmt(item.amount)} điểm — ${item.reason||""}`;
    if (item._type==="plays_bought")  return `${item.user_id} — Mua ${fmt(item.amount)} lượt chơi`;
    if (item._type==="plays_earned")  return `${item.user_id} — +${fmt(item.amount)} lượt (đơn hàng)`;
    if (item._type==="plays_given")   return `${item.user_id} — Admin tặng ${fmt(item.amount)} lượt`;
    if (item._type==="profile_change") return `${item.user_id} — Đổi ${item.field||"thông tin"} (${item.points_used||0} điểm)`;
    return `${item.event_name||item._type} — ${item.user_id||""}`;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>📋 Activity Logs</h2>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>setAutoRefresh(v=>!v)} style={{
            background: autoRefresh?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.05)",
            border:`1px solid ${autoRefresh?"#4CAF50":"#333"}`,
            color: autoRefresh?"#4CAF50":"#888",
            borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer"
          }}>{autoRefresh?"🟢 Auto":"⚫ Auto"}</button>
          <button onClick={()=>fetchLogs(tab,page)} style={{
            background:"#D4531C", border:"none", color:"white",
            borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer"
          }}>🔄 Refresh</button>
        </div>
      </div>

      {/* Search */}
      <input placeholder="🔍 Tìm theo SĐT, tên, mã đơn..."
        value={search} onChange={e=>setSearch(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&fetchLogs(tab,1)}
        style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
          borderRadius:10, padding:"10px 14px", color:"white", fontSize:13,
          marginBottom:14, boxSizing:"border-box" }}/>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none",
        marginBottom:14, paddingBottom:4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            whiteSpace:"nowrap", padding:"6px 12px", borderRadius:20, flexShrink:0,
            border: tab===t.key?"none":"1px solid #2a2a38",
            background: tab===t.key?"#D4531C":"#1a1a24",
            color: tab===t.key?"white":"#888",
            fontSize:11, fontWeight:700, cursor:"pointer"
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Logs */}
      {loading ? (
        <p style={{ color:"#666", textAlign:"center", padding:20 }}>Đang tải...</p>
      ) : logs.length===0 ? (
        <p style={{ color:"#666", textAlign:"center", padding:40 }}>Không có dữ liệu</p>
      ) : (
        <div>
          {logs.map((log, i) => {
            const c = getColor(log);
            return (
              <div key={i} style={{ background:c.bg, border:`1px solid ${c.color}22`,
                borderRadius:10, padding:"10px 14px", marginBottom:6,
                display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{c.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:"white", fontSize:12, fontWeight:700, margin:"0 0 2px",
                    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                    {getTitle(log)}
                  </p>
                  <p style={{ color:"#888", fontSize:10, margin:0 }}>
                    {fmtD(log.created_at||log.played_at||log.timestamp)}
                    {log.status&&<span style={{ marginLeft:8, color:log.status==="confirmed"?"#4CAF50":"#FF9800" }}>
                      {log.status}
                    </span>}
                  </p>
                </div>
                <span style={{ color:c.color, fontSize:10, fontWeight:700, flexShrink:0 }}>
                  {log._type}
                </span>
              </div>
            );
          })}

          {/* Pagination */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16 }}>
            <button onClick={()=>{setPage(p=>Math.max(1,p-1));fetchLogs(tab,Math.max(1,page-1));}}
              disabled={page===1} style={{ background:"#1a1a24", border:"1px solid #333",
                color:page===1?"#444":"white", borderRadius:8, padding:"6px 14px",
                fontSize:12, cursor:page===1?"default":"pointer" }}>← Trước</button>
            <span style={{ color:"#888", fontSize:12, padding:"6px 10px" }}>Trang {page}</span>
            <button onClick={()=>{setPage(p=>p+1);fetchLogs(tab,page+1);}}
              disabled={logs.length<50} style={{ background:"#1a1a24", border:"1px solid #333",
                color:logs.length<50?"#444":"white", borderRadius:8, padding:"6px 14px",
                fontSize:12, cursor:logs.length<50?"default":"pointer" }}>Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}
