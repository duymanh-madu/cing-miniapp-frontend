import { useState, useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";

const TIERS = { member:"🌱", loyal:"💚", silver:"🥈", gold:"🥇", diamond:"💎", partner:"🤝", loyal_partner:"👑" };
const fmt  = n => new Intl.NumberFormat("vi-VN").format(n||0);
const fmtDur = s => {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}p ${s%60}s`;
  return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}p`;
};
const fmtDate = str => {
  if (!str) return "—";
  return new Date(str).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
};

export default function AdminMonitor({ token }) {
  const [stats,   setStats]   = useState(null);
  const [online,  setOnline]  = useState([]);
  const [offline, setOffline] = useState([]);
  const [tab,     setTab]     = useState("overview");
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState("");
  const [pageFilter, setPageFilter] = useState("all");
  const timerRef = useRef(null);
  const h = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      const [s, o, f] = await Promise.all([
        apiClient.get("/admin/monitor/stats",          { headers:h }),
        apiClient.get("/admin/monitor/online",         { headers:h }),
        apiClient.get("/admin/monitor/recent-offline", { headers:h }),
      ]);
      setStats(s.data?.data);
      setOnline(o.data?.data || []);
      setOffline(f.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (autoRefresh) timerRef.current = setInterval(fetchAll, 10000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh]);

  const TABS = [
    { key:"overview", label:"📊 Tổng quan" },
    { key:"online",   label:`🟢 Online (${online.length})` },
    { key:"offline",  label:`⚫ Offline gần đây` },
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>👁 Member Monitor</h2>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={() => setAutoRefresh(v=>!v)} style={{
            background: autoRefresh?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.05)",
            border:`1px solid ${autoRefresh?"#4CAF50":"Top 333"}`,
            color:autoRefresh?"#4CAF50":"Top 666",
            borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer"
          }}>{autoRefresh?"🟢 Auto":"⚫ Auto"}</button>
          <button onClick={fetchAll} style={{
            background:"#D4531C", border:"none", color:"white",
            borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer"
          }}>🔄</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:"7px 14px", borderRadius:20,
            border: tab===t.key?"none":"1px solid #2a2a38",
            background: tab===t.key?"#D4531C":"#1a1a24",
            color: tab===t.key?"white":"Top 888",
            fontSize:11, fontWeight:700, cursor:"pointer"
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? <p style={{ color:"Top 666" }}>Đang tải...</p> : (<>

        {/* OVERVIEW */}
        {tab === "overview" && stats && (
          <div>
            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Đang online",   value:stats.online_now,  color:"#4CAF50", icon:"🟢" },
                { label:"Tổng members",  value:stats.total,       color:"#2196F3", icon:"👥" },
                { label:"Active 24h",    value:stats.active_24h,  color:"#FF9800", icon:"📱" },
                { label:"Active 7 ngày", value:stats.active_7d,   color:"#9C27B0", icon:"📅" },
                { label:"Active 30 ngày",value:stats.active_30d,  color:"#00BCD4", icon:"📆" },
                { label:"Không active",  value:stats.inactive,    color:"#f44336", icon:"💤" },
              ].map((s,i) => (
                <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"12px 10px",
                  border:`1px solid ${s.color}22`, textAlign:"center" }}>
                  <p style={{ fontSize:18, margin:"0 0 4px" }}>{s.icon}</p>
                  <p style={{ color:s.color, fontSize:18, fontWeight:900, margin:"0 0 2px" }}>
                    {fmt(s.value)}
                  </p>
                  <p style={{ color:"Top 666", fontSize:9, margin:0, fontWeight:700 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Online users preview */}
            <div style={{ background:"#1a1a24", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
              <p style={{ color:"#4CAF50", fontSize:11, fontWeight:800, margin:"0 0 10px", letterSpacing:2 }}>
                🟢 ĐANG ONLINE ({online.length})
              </p>
              {online.slice(0,5).map((u,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:8, height:8, borderRadius:4, background:"#4CAF50", flexShrink:0 }}/>
                  <div style={{ width:28, height:28, borderRadius:14, overflow:"hidden", flexShrink:0,
                    background:"linear-gradient(135deg,#D4531C,#ff6b35)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:900, color:"white" }}>
                    {u.avatar ? <img src={u.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : (u.name||"?")[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:"white", fontSize:12, fontWeight:700, margin:0 }}>{u.name}</p>
                    <p style={{ color:"Top 666", fontSize:10, margin:0 }}>{TIERS[u.tier]||"🌱"} · Online {fmtDur(u.connectedDuration)}</p>
                  </div>
                </div>
              ))}
              {online.length > 5 && (
                <button onClick={() => setTab("online")} style={{ background:"none", border:"none",
                  color:"#D4531C", fontSize:11, cursor:"pointer", padding:0, marginTop:4 }}>
                  Xem tất cả {online.length} người →
                </button>
              )}
              {online.length === 0 && <p style={{ color:"Top 555", fontSize:12 }}>Không có ai online</p>}
            </div>
          </div>
        )}

        {/* ONLINE LIST */}
        {tab === "online" && (
          <div>
            {/* Page stats */}
            {(() => {
              const pageCounts = {};
              online.forEach(u => {
                const p = u.currentPage || "Không xác định";
                pageCounts[p] = (pageCounts[p] || 0) + 1;
              });
              const pages = [["all", "Tất cả", online.length], ...Object.entries(pageCounts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,k,v])];
              return (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                  {pages.map(([key, label, count]) => (
                    <button key={key} onClick={() => setPageFilter(key)} style={{
                      padding:"5px 10px", borderRadius:20, fontSize:10, fontWeight:700, cursor:"pointer",
                      border: pageFilter===key ? "none" : "1px solid #2a2a38",
                      background: pageFilter===key ? "#D4531C" : "#1a1a24",
                      color: pageFilter===key ? "white" : "Top 888",
                    }}>
                      {label} <span style={{ opacity:0.7 }}>({count})</span>
                    </button>
                  ))}
                </div>
              );
            })()}
            {/* Search */}
            <input
              placeholder="🔍 Tìm theo tên hoặc số điện thoại..."
              onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #2a2a38",
                background:"#1a1a24", color:"white", fontSize:12, marginBottom:12,
                outline:"none", boxSizing:"border-box" }}
            />
            {online.filter(u => {
              const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.userId?.includes(search);
              const matchPage = pageFilter === "all" || (u.currentPage || "Không xác định") === pageFilter;
              return matchSearch && matchPage;
            }).length === 0 ? (
              <p style={{ color:"Top 666", textAlign:"center", padding:40 }}>Không tìm thấy</p>
            ) : online.filter(u => {
              const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.userId?.includes(search);
              const matchPage = pageFilter === "all" || (u.currentPage || "Không xác định") === pageFilter;
              return matchSearch && matchPage;
            }).map((u,i) => (
              <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"12px 14px",
                marginBottom:8, border:"1px solid rgba(76,175,80,0.2)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: (u.currentPage||u.currentGame) ? 8 : 0 }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div style={{ width:40, height:40, borderRadius:20, overflow:"hidden",
                      background:"linear-gradient(135deg,#D4531C,#ff6b35)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:16, fontWeight:900, color:"white" }}>
                      {u.avatar ? <img src={u.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : (u.name||"?")[0]?.toUpperCase()}
                    </div>
                    <div style={{ position:"absolute", bottom:0, right:0,
                      width:10, height:10, borderRadius:5, background:"#4CAF50",
                      border:"2px solid #1a1a24" }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>{u.name}</p>
                    <p style={{ color:"Top 888", fontSize:10, margin:0 }}>
                      {TIERS[u.tier]||"🌱"} {u.tier} · {fmt(u.points)}đ · {u.userId}
                    </p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ color:"#4CAF50", fontSize:11, fontWeight:800, margin:0 }}>
                      🟢 {fmtDur(u.connectedDuration)}
                    </p>
                    <p style={{ color:"Top 555", fontSize:9, margin:0 }}>{fmtDate(u.connectedAt)}</p>
                  </div>
                </div>
                {/* Activity row */}
                {(u.currentPage || u.currentGame) && (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {u.currentPage && (
                      <span style={{ background:"rgba(33,150,243,0.15)", border:"1px solid rgba(33,150,243,0.3)",
                        borderRadius:6, padding:"2px 8px", fontSize:10, color:"#64B5F6" }}>
                        📍 {u.currentPage}
                      </span>
                    )}
                    {u.currentGame && (
                      <span style={{ background:"rgba(255,152,0,0.15)", border:"1px solid rgba(255,152,0,0.3)",
                        borderRadius:6, padding:"2px 8px", fontSize:10, color:"#FFB74D" }}>
                        🎮 {u.currentGame} · {fmtDur(u.gameDuration)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* OFFLINE LIST */}
        {tab === "offline" && (
          <div>
            {offline.length === 0 ? (
              <p style={{ color:"Top 666", textAlign:"center", padding:40 }}>Chưa có dữ liệu</p>
            ) : offline.map((u,i) => (
              <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"12px 14px",
                marginBottom:8, border:"1px solid rgba(255,255,255,0.05)",
                display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:40, height:40, borderRadius:20, overflow:"hidden",
                    background:"linear-gradient(135deg,#333,#555)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16, fontWeight:900, color:"rgba(255,255,255,0.5)" }}>
                    {u.avatar ? <img src={u.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : (u.name||"?")[0]?.toUpperCase()}
                  </div>
                  <div style={{ position:"absolute", bottom:0, right:0,
                    width:10, height:10, borderRadius:5, background:"Top 666",
                    border:"2px solid #1a1a24" }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>{u.name}</p>
                  <p style={{ color:"Top 888", fontSize:10, margin:0 }}>
                    {TIERS[u.tier]||"🌱"} {u.tier} · {fmt(u.points)} điểm
                  </p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ color: u.offlineDuration < 3600 ? "#FF9800" : "Top 666",
                    fontSize:11, fontWeight:700, margin:0 }}>
                    ⚫ {fmtDur(u.offlineDuration)} trước
                  </p>
                  <p style={{ color:"Top 555", fontSize:9, margin:0 }}>
                    {fmtDate(u.lastSeen)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </>)}
    </div>
  );
}
