import { useState, useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";

const TABS = [
  { key:"all",            label:"Tất cả",          icon:"📋" },
  { key:"orders",         label:"Đơn hàng",         icon:"🧋" },
  { key:"points",         label:"Điểm tích lũy",    icon:"💎" },
  { key:"payments",       label:"Thanh toán",        icon:"💳" },
  { key:"games",          label:"Game",              icon:"🎮" },
  { key:"plays_bought",   label:"Mua lượt chơi",     icon:"🎯" },
  { key:"plays_earned",   label:"Lượt chơi từ ĐH",  icon:"🎁" },
  { key:"plays_given",    label:"Tặng lượt chơi",   icon:"🎀" },
  { key:"rewards",        label:"Nhận quà BXH",      icon:"🏆" },
  { key:"profile_changes",label:"Thay đổi hồ sơ",   icon:"👤" },
];

const fmt = n => new Intl.NumberFormat("vi-VN").format(n||0);
function fmtDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})
    + " " + d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
}

function getStyle(item) {
  if (item._type==="order")          return { color:"#D4531C", bg:"rgba(212,83,28,0.1)",  icon:"🧋" };
  if (item._type==="payment")        return { color:"#2E7D32", bg:"rgba(46,125,50,0.1)",  icon:"💳" };
  if (item._type==="game")           return { color:"#1565C0", bg:"rgba(21,101,192,0.1)", icon:"🎮" };
  if (item._type==="points")         return { color:"#7B1FA2", bg:"rgba(123,31,162,0.1)", icon:"💎" };
  if (item._type==="plays_bought")   return { color:"#FF9800", bg:"rgba(255,152,0,0.1)",  icon:"🎯" };
  if (item._type==="plays_earned")   return { color:"#4CAF50", bg:"rgba(76,175,80,0.1)",  icon:"🎁" };
  if (item._type==="plays_given")    return { color:"#e879f9", bg:"rgba(232,121,249,0.1)",icon:"🎀" };
  if (item._type==="reward")         return { color:"#FFD700", bg:"rgba(255,215,0,0.1)",  icon:"🏆" };
  if (item._type==="profile_change") return { color:"#607D8B", bg:"rgba(96,125,139,0.1)",icon:"👤" };
  return { color:"Top 999", bg:"rgba(0,0,0,0.05)", icon:"📋" };
}

function getTitle(item) {
  const id = item.customer_phone || item.user_id || "?";
  const name = item.customer_name || item.player_name || id;
  if (item._type==="order")   return `${name} — Đơn ${item.order_code||item.id} — ${fmt(item.total_amount)}đ`;
  if (item._type==="payment") return `${name} — ${fmt(item.amount)}đ (${item.payment_status||""})`;
  if (item._type==="game")    return `${name} — ${item.game_key} — điểm ${fmt(item.score)}`;
  if (item._type==="points")  return `${id} — ${item.reason||item.event_name} — ${item.amount>0?"+":""}${item.amount} điểm`;
  if (item._type==="plays_bought")  return `${id} — Mua ${item.amount} lượt (${item.points_used||0} điểm)`;
  if (item._type==="plays_earned")  return `${id} — +${item.amount} lượt từ đơn hàng`;
  if (item._type==="plays_given")   return `${id} — Admin tặng ${item.amount} lượt`;
  if (item._type==="reward")        return `${item.player_name||id} — Nhận ${item.points} điểm (${item.board||""} ${item.rank?"#"+item.rank:""})`;
  if (item._type==="profile_change") return `${id} — Cập nhật ${item.field||"hồ sơ"}`;
  return JSON.stringify(item).slice(0,80);
}

export default function AdminLogs({ token }) {
  const h = { Authorization: `Bearer ${token}` };
  const [tab, setTab]           = useState("all");
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const timerRef = useRef(null);

  const fetchLogs = async (t = tab, p = page, s = search) => {
    setLoading(true);
    try {
      let url = `/admin/logs?filter=${t}&page=${p}&limit=50`;
      if (s) url += `&search=${encodeURIComponent(s)}`;
      const res = await apiClient.get(url, { headers: h });
      setLogs(res.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(tab, 1, search); setPage(1); }, [tab, search]);
  useEffect(() => {
    if (autoRefresh) { timerRef.current = setInterval(()=>fetchLogs(tab,1,search), 10000); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, tab, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div style={{ padding:"0 0 40px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <p style={{ color:"#aaa", fontSize:11, fontWeight:700, letterSpacing:2, margin:0, textTransform:"uppercase" }}>
          📋 Activity Logs
        </p>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>fetchLogs(tab,page,search)}
            style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8, padding:"5px 12px", color:"white", fontSize:11, cursor:"pointer" }}>
            🔄 Làm mới
          </button>
          <button onClick={()=>setAutoRefresh(v=>!v)}
            style={{ background: autoRefresh?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.08)",
              border:`1px solid ${autoRefresh?"#4CAF50":"rgba(255,255,255,0.1)"}`,
              borderRadius:8, padding:"5px 12px", color: autoRefresh?"#4CAF50":"#aaa", fontSize:11, cursor:"pointer" }}>
            {autoRefresh ? "⏸ Auto" : "▶ Auto"}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="🔍 Tìm theo số điện thoại, tên, mã đơn..."
          style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:10, padding:"9px 14px", color:"white", fontSize:13, outline:"none" }}
        />
        <button type="submit"
          style={{ background:"#D4531C", border:"none", borderRadius:10, padding:"9px 16px",
            color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          Tìm
        </button>
        {search && (
          <button type="button" onClick={()=>{ setSearch(""); setSearchInput(""); }}
            style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:10, padding:"9px 12px", color:"#aaa", fontSize:13, cursor:"pointer" }}>
            ✕
          </button>
        )}
      </form>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:14, paddingBottom:4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ background: tab===t.key ? "#D4531C" : "rgba(255,255,255,0.07)",
              border: "none", borderRadius:20, padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap",
              color: tab===t.key ? "white" : "#aaa", fontSize:11, fontWeight:700 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Log list */}
      {loading ? (
        <p style={{ color:"Top 555", textAlign:"center", padding:40 }}>Đang tải...</p>
      ) : logs.length === 0 ? (
        <p style={{ color:"Top 555", textAlign:"center", padding:40 }}>Không có dữ liệu</p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {logs.map((item, i) => {
            const st = getStyle(item);
            return (
              <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"10px 14px",
                borderLeft:`3px solid ${st.color}`, display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{st.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:"white", fontSize:12, fontWeight:600, margin:"0 0 3px",
                    wordBreak:"break-word" }}>{getTitle(item)}</p>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, color:st.color, background:st.bg,
                      borderRadius:4, padding:"1px 6px", fontWeight:700 }}>{item._type}</span>
                    <span style={{ fontSize:10, color:"Top 555" }}>{fmtDate(item.created_at)}</span>
                    {item.status && <span style={{ fontSize:10, color:"Top 888" }}>{item.status}</span>}
                    {item.source && <span style={{ fontSize:10, color:"Top 666" }}>via {item.source}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16 }}>
        <button onClick={()=>{ const p=Math.max(1,page-1); setPage(p); fetchLogs(tab,p,search); }}
          disabled={page<=1}
          style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
            padding:"6px 16px", color: page<=1?"Top 444":"white", cursor: page<=1?"not-allowed":"pointer", fontSize:12 }}>
          ← Trước
        </button>
        <span style={{ color:"Top 666", fontSize:12, padding:"6px 0" }}>Trang {page}</span>
        <button onClick={()=>{ const p=page+1; setPage(p); fetchLogs(tab,p,search); }}
          disabled={logs.length<50}
          style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
            padding:"6px 16px", color: logs.length<50?"Top 444":"white", cursor: logs.length<50?"not-allowed":"pointer", fontSize:12 }}>
          Sau →
        </button>
      </div>
    </div>
  );
}
