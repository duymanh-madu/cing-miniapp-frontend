import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const ALL_BADGES = [
  { key:"member",        label:"Hội viên",             icon:"🌱", color:"#888780", desc:"Mặc định khi đăng ký" },
  { key:"loyal",         label:"Hội viên thân thiết",  icon:"💚", color:"#1d9e75", desc:"Chi tiêu đủ điều kiện" },
  { key:"silver",        label:"Hội viên bạc",         icon:"🥈", color:"#378add", desc:"Hạng bạc" },
  { key:"gold",          label:"Hội viên vàng",        icon:"🥇", color:"#ef9f27", desc:"Hạng vàng" },
  { key:"partner",       label:"Đối tác",              icon:"🤝", color:"#7f77dd", desc:"Đối tác thương hiệu" },
  { key:"diamond",       label:"Kim cương",            icon:"💎", color:"#3a8adf", desc:"Đỉnh cao thành viên" },
  { key:"loyal_partner", label:"Đối tác thân thiết",  icon:"👑", color:"#d4537e", desc:"Đối tác VIP" },
  { key:"champion",      label:"Kiện tướng",           icon:"♟️", color:"#ffd700", desc:"Top 1 BXH Cờ vua (Live)" },
  { key:"hof_1",         label:"Vương Giả",            icon:"♦️", color:"#ff80a0", desc:"Top 1 BXH Tiêu dùng Alltime (Live)" },
  { key:"hof_2",         label:"Phú Hào",              icon:"♦️", color:"#80a0ff", desc:"Top 2 BXH Tiêu dùng Alltime (Live)" },
  { key:"hof_3",         label:"Địa Chủ",              icon:"♦️", color:"#40ee80", desc:"Top 3 BXH Tiêu dùng Alltime (Live)" },
];

export default function AdminBadges({ token }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // player đang chọn
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiClient.get("/admin/monitor/players-badges", { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setPlayers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = players.filter(p =>
    p.user_id?.includes(search) || p.zalo_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleBadge = async (player, badgeKey) => {
    setSaving(true);
    try {
      const hasBadge = player.custom_badges?.includes(badgeKey);
      const newBadges = hasBadge
        ? (player.custom_badges || []).filter(b => b !== badgeKey)
        : [...(player.custom_badges || []), badgeKey];
      await apiClient.post("/admin/monitor/update-player-badges",
        { user_id: player.user_id, custom_badges: newBadges },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      setPlayers(ps => ps.map(p => p.user_id === player.user_id ? { ...p, custom_badges: newBadges } : p));
      if (selected?.user_id === player.user_id) setSelected(p => ({ ...p, custom_badges: newBadges }));
      setMsg("Đã cập nhật danh hiệu");
      setTimeout(() => setMsg(""), 2000);
    } catch(e) {
      setMsg("Lỗi: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ padding:24, color:"white" }}>
      <h2 style={{ fontSize:20, fontWeight:900, margin:"0 0 6px" }}>🏅 Quản lý danh hiệu</h2>
      <p style={{ color:"#888", fontSize:13, margin:"0 0 20px" }}>Xem và cấp/thu hồi danh hiệu cho thành viên</p>

      {msg && <div style={{ background:"rgba(212,83,28,.2)", border:"1px solid #D4531C", borderRadius:8, padding:"8px 14px", marginBottom:16, fontSize:13 }}>{msg}</div>}

      {/* Danh sách tất cả badge + số user */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10, marginBottom:24 }}>
        {ALL_BADGES.map(b => {
          const count = players.filter(p => {
            if (b.key === "champion" || b.key.startsWith("hof_")) return false;
            return p.crm_tier === b.key || p.custom_badges?.includes(b.key);
          }).length;
          return (
            <div key={b.key} style={{ background:"#1a1a24", borderRadius:12, padding:"14px 16px", border:`1px solid ${b.color}33` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:22 }}>{b.icon}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:800, color:b.color, margin:0 }}>{b.label}</p>
                  <p style={{ fontSize:10, color:"#666", margin:0 }}>{b.desc}</p>
                </div>
              </div>
              <p style={{ fontSize:12, color:"#aaa", margin:0 }}>{count} thành viên</p>
            </div>
          );
        })}
      </div>

      {/* Tìm kiếm player */}
      <div style={{ display:"flex", gap:12, marginBottom:16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc số điện thoại..."
          style={{ flex:1, background:"#1a1a24", border:"1px solid #333", borderRadius:8, padding:"8px 12px", color:"white", fontSize:13 }}/>
      </div>

      {loading ? <p style={{ color:"#666" }}>Đang tải...</p> : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.slice(0,50).map(p => (
            <div key={p.user_id} style={{ background:"#1a1a24", borderRadius:12, padding:"14px 16px", border:"1px solid #2a2a38", cursor:"pointer" }}
              onClick={() => setSelected(selected?.user_id === p.user_id ? null : p)}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"#2a2a38", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                  {p.zalo_avatar ? <img src={p.zalo_avatar} style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover" }}/> : "👤"}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"white", margin:0 }}>{p.zalo_name || p.user_id}</p>
                  <p style={{ fontSize:11, color:"#666", margin:0 }}>{p.user_id}</p>
                </div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end" }}>
                  {(p.custom_badges || []).map(b => {
                    const bc = ALL_BADGES.find(x => x.key === b);
                    return bc ? <span key={b} style={{ fontSize:14 }}>{bc.icon}</span> : null;
                  })}
                </div>
                <span style={{ color:"#666", fontSize:12 }}>{selected?.user_id === p.user_id ? "▲" : "▼"}</span>
              </div>

              {selected?.user_id === p.user_id && (
                <div style={{ marginTop:14, borderTop:"1px solid #2a2a38", paddingTop:14 }}
                  onClick={e => e.stopPropagation()}>
                  <p style={{ fontSize:12, color:"#888", margin:"0 0 10px" }}>Chọn danh hiệu cấp thủ công:</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {ALL_BADGES.filter(b => !["champion","hof_1","hof_2","hof_3"].includes(b.key)).map(b => {
                      const has = p.custom_badges?.includes(b.key);
                      return (
                        <button key={b.key} disabled={saving}
                          onClick={() => handleToggleBadge(p, b.key)}
                          style={{ padding:"6px 12px", borderRadius:20, border:`1.5px solid ${has ? b.color : "#333"}`, background: has ? `${b.color}22` : "transparent", color: has ? b.color : "#666", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                          <span>{b.icon}</span> {b.label}
                          {has && <span style={{ fontSize:10 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
