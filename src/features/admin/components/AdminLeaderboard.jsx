import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const PERIODS = [
  { key:"weekly", label:"Tuần", icon:"📅", resetInfo:"Thứ Hai hàng tuần" },
  { key:"monthly", label:"Tháng", icon:"🗓", resetInfo:"Ngày 1 hàng tháng" },
  { key:"yearly", label:"Năm", icon:"📆", resetInfo:"Ngày 1 tháng 1 hàng năm" },
  { key:"custom", label:"Tuỳ chỉnh", icon:"🎯", resetInfo:"Theo cấu hình admin" },
  { key:"alltime", label:"Tất cả", icon:"🏆", resetInfo:"Không reset" },
];

const GAMES = [
  { key:"black-pearl-rush", label:"Bay cùng trân châu", icon:"🫧" },
  { key:"chess-wins", label:"Kỳ thủ cờ vua — Thắng nhiều nhất", icon:"♟️" },
  { key:"chess-streak", label:"Kỳ thủ cờ vua — Chuỗi thắng dài nhất", icon:"🔥" },
];

function defaultConfig() {
  return {
    spending: {
      weekly: { enabled:true, rewards:[{rank:1,points:100},{rank:2,points:50},{rank:3,points:30}] },
      monthly:{ enabled:true, rewards:[{rank:1,points:200},{rank:2,points:100},{rank:3,points:60}] },
      yearly: { enabled:false,rewards:[{rank:1,points:500},{rank:2,points:300},{rank:3,points:200}] },
      custom: { enabled:false,rewards:[{rank:1,points:300},{rank:2,points:200},{rank:3,points:100}] },
      alltime:{ enabled:true, rewards:[] },
    },
    games: {
      "black-pearl-rush": { enabled:true, weekly_reset:true, rewards:[{rank:1,points:50},{rank:2,points:30},{rank:3,points:20}] },
      "chess-wins": { enabled:true, weekly_reset:false, rewards:[{rank:1,points:100},{rank:2,points:60},{rank:3,points:40}] },
      "chess-streak": { enabled:true, weekly_reset:false, rewards:[{rank:1,points:80},{rank:2,points:50},{rank:3,points:30}] },
    },
  };
}

export default function AdminLeaderboard({ token }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [distributing, setDistributing] = useState("");
  const [resetting, setResetting] = useState("");

  const [topOpen, setTopOpen] = useState(false);
  const [topTitle, setTopTitle] = useState("");
  const [topRows, setTopRows] = useState([]);
  const [topLoading, setTopLoading] = useState(false);

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/admin/leaderboard/config", { headers:h })
      .then(r => {
        const def = defaultConfig();
        const db = r.data?.data || {};
        setConfig({
          spending: { ...def.spending, ...(db.spending || {}) },
          games: { ...def.games, ...(db.games || {}) },
        });
      })
      .catch(() => setConfig(defaultConfig()))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/admin/leaderboard/config", { leaderboard_config:config }, { headers:h });
      setMsg("✅ Đã lưu cấu hình!");
    } catch (e) {
      setMsg("❌ " + e.message);
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const distribute = async (type, period, game_key) => {
    const key = type + (period || game_key);
    setDistributing(key);
    try {
      const res = await apiClient.post("/admin/leaderboard/distribute-rewards", { type, period, game_key }, { headers:h });
      const results = res.data?.data || [];
      setMsg(`✅ Đã phát thưởng: ${results.map(r => `Top${r.rank} ${r.name} +${r.points} điểm`).join(", ")}`);
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || e.message));
    }
    setDistributing("");
    setTimeout(() => setMsg(""), 6000);
  };

  const manualReset = async () => {
    if (!window.confirm("Reset BXH tuần ngay và phát thưởng?")) return;
    try {
      await apiClient.post("/admin/leaderboard/manual-weekly-reset", {}, { headers:h });
      setMsg("✅ Đang reset BXH tuần...");
    } catch (e) {
      setMsg("❌ " + e.message);
    }
    setTimeout(() => setMsg(""), 5000);
  };

  const resetGame = async (game_key) => {
    if (game_key === "chess-wins" || game_key === "chess-streak") {
      setMsg("⚠️ BXH cờ vua là all-time, không reset theo game_scores.");
      setTimeout(() => setMsg(""), 4000);
      return;
    }

    if (!window.confirm(`Reset bảng xếp hạng ${game_key}?`)) return;
    setResetting(game_key);
    try {
      const res = await apiClient.post("/admin/leaderboard/reset-game-scores", { game_key }, { headers:h });
      setMsg(`✅ ${res.data?.message}`);
    } catch (e) {
      setMsg("❌ " + e.message);
    }
    setResetting("");
    setTimeout(() => setMsg(""), 4000);
  };

  const openTop100 = async ({ type, key, title }) => {
    setTopOpen(true);
    setTopTitle(title);
    setTopRows([]);
    setTopLoading(true);

    try {
      const url = type === "spending"
        ? `/leaderboard/top100/spending?period=${key}`
        : `/leaderboard/top100/game/${key}`;

      const res = await apiClient.get(url, { headers:h });
      setTopRows(res.data?.data || []);
    } catch (e) {
      setMsg("❌ Không tải được Top 100: " + e.message);
    } finally {
      setTopLoading(false);
    }
  };

  const updateReward = (section, key, index, field, value) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section][key].rewards[index][field] = field === "points" ? Number(value) : value;
      return next;
    });
  };

  const toggleEnabled = (section, key) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section][key].enabled = !next[section][key].enabled;
      return next;
    });
  };

  const toggleWeeklyReset = (key) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.games[key].weekly_reset = !next.games[key].weekly_reset;
      return next;
    });
  };

  if (loading) return <div style={{ color:"#666", padding:20 }}>Đang tải...</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 4px" }}>
            🏆 Bảng xếp hạng & Phần thưởng
          </h2>
          <p style={{ color:"#666", fontSize:12, margin:0 }}>
            Cấu hình thưởng, reset và theo dõi Top 100 trực tiếp
          </p>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={manualReset} style={{ background:"rgba(255,152,0,0.15)", border:"1px solid #FF9800", color:"#FF9800", borderRadius:10, padding:"10px 16px", fontWeight:800, cursor:"pointer", fontSize:12 }}>
            🎁 Reset tuần + tạo quà chờ nhận
          </button>
          <button onClick={save} disabled={saving} style={{ background:"#D4531C", border:"none", color:"white", borderRadius:10, padding:"10px 24px", fontWeight:800, cursor:"pointer" }}>
            {saving ? "Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ background:msg.includes("✅") ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", border:`1px solid ${msg.includes("✅") ? "#4CAF50" : "#f44336"}`, borderRadius:10, padding:"12px 16px", marginBottom:16, color:msg.includes("✅") ? "#4CAF50" : "#f44336", fontSize:13 }}>
          {msg}
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:2, margin:"0 0 12px", textTransform:"uppercase" }}>
          💰 Bảng xếp hạng tiêu dùng
        </p>

        {PERIODS.map(p => {
          const pc = config?.spending?.[p.key] || {};
          const isEnabled = pc.enabled;

          return (
            <div key={p.key} style={{ background:"#1a1a24", borderRadius:14, padding:"16px 20px", marginBottom:12, border:`1px solid ${isEnabled ? "#D4531C44" : "#2a2a38"}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{p.icon}</span>
                  <div>
                    <p style={{ color:"white", fontWeight:800, margin:0 }}>Bảng xếp hạng {p.label}</p>
                    <p style={{ color:"#666", fontSize:11, margin:"2px 0 0" }}>{p.resetInfo}</p>
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <button onClick={() => openTop100({ type:"spending", key:p.key, title:`Top 100 BXH ${p.label}` })} style={{ background:"rgba(33,150,243,0.15)", border:"1px solid #2196F3", color:"#2196F3", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    👁 Top 100
                  </button>

                  {p.key !== "alltime" && (
                    <button onClick={() => distribute("spending", p.key, null)} disabled={!isEnabled || distributing === "spending" + p.key} style={{ background:isEnabled ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)", border:`1px solid ${isEnabled ? "#FFD700" : "#333"}`, color:isEnabled ? "#FFD700" : "#444", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:isEnabled ? "pointer" : "default" }}>
                      {distributing === "spending" + p.key ? "Đang phát..." : "⚡ Cộng điểm trực tiếp"}
                    </button>
                  )}

                  <button onClick={() => toggleEnabled("spending", p.key)} style={{ background:isEnabled ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)", border:`1px solid ${isEnabled ? "#4CAF50" : "#ff6b6b"}`, color:isEnabled ? "#4CAF50" : "#ff6b6b", borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    {isEnabled ? "BẬT" : "TẮT"}
                  </button>
                </div>
              </div>

              {isEnabled && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {(pc.rewards || []).map((r, i) => (
                    <div key={i} style={{ background:"#12121a", borderRadius:10, padding:"10px 12px" }}>
                      <p style={{ color:i===0 ? "#FFD700" : i===1 ? "#C0C0C0" : "#CD7F32", fontSize:11, fontWeight:800, margin:"0 0 6px" }}>
                        {i===0 ? "🥇" : i===1 ? "🥈" : "🥉"} Top {r.rank}
                      </p>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input type="number" value={r.points} onChange={e => updateReward("spending", p.key, i, "points", e.target.value)} style={{ width:"100%", background:"#2a2a38", border:"1px solid #333", borderRadius:6, padding:"6px 8px", color:"white", fontSize:13, fontWeight:700, textAlign:"center" }} />
                        <span style={{ color:"#666", fontSize:10, whiteSpace:"nowrap" }}>điểm thưởng</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:2, margin:"0 0 12px", textTransform:"uppercase" }}>
          🎮 Bảng xếp hạng game
        </p>

        {GAMES.map(g => {
          const gc = config?.games?.[g.key] || {};
          const isEnabled = gc.enabled;
          const isChess = g.key === "chess-wins" || g.key === "chess-streak";

          return (
            <div key={g.key} style={{ background:"#1a1a24", borderRadius:14, padding:"16px 20px", marginBottom:12, border:`1px solid ${isEnabled ? "#7c3aed44" : "#2a2a38"}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{g.icon}</span>
                  <div>
                    <p style={{ color:"white", fontWeight:800, margin:0 }}>{g.label}</p>
                    <p style={{ color:"#666", fontSize:11, margin:"2px 0 0" }}>
                      {isChess ? "All-time theo thống kê cờ vua" : gc.weekly_reset ? "Reset mỗi thứ Hai" : "Không reset"}
                    </p>
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <button onClick={() => openTop100({ type:"game", key:g.key, title:`Top 100 ${g.label}` })} style={{ background:"rgba(33,150,243,0.15)", border:"1px solid #2196F3", color:"#2196F3", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    👁 Top 100
                  </button>

                  <button onClick={() => distribute("game", null, g.key)} disabled={!isEnabled || distributing === "game" + g.key} style={{ background:isEnabled ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)", border:`1px solid ${isEnabled ? "#FFD700" : "#333"}`, color:isEnabled ? "#FFD700" : "#444", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:isEnabled ? "pointer" : "default" }}>
                    {distributing === "game" + g.key ? "Đang phát..." : "⚡ Cộng điểm trực tiếp"}
                  </button>

                  {!isChess && (
                    <button onClick={() => resetGame(g.key)} disabled={resetting === g.key} style={{ background:"rgba(244,67,54,0.15)", border:"1px solid #f44336", color:"#f44336", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                      {resetting === g.key ? "Đang reset..." : "🔄 Reset tuần"}
                    </button>
                  )}

                  <button onClick={() => toggleEnabled("games", g.key)} style={{ background:isEnabled ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)", border:`1px solid ${isEnabled ? "#4CAF50" : "#ff6b6b"}`, color:isEnabled ? "#4CAF50" : "#ff6b6b", borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    {isEnabled ? "BẬT" : "TẮT"}
                  </button>
                </div>
              </div>

              {isEnabled && (
                <>
                  {!isChess && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #2a2a38", marginBottom:10 }}>
                      <p style={{ color:"#888", fontSize:12, margin:0 }}>🔄 Auto reset mỗi tuần</p>
                      <button onClick={() => toggleWeeklyReset(g.key)} style={{ background:gc.weekly_reset ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)", border:`1px solid ${gc.weekly_reset ? "#4CAF50" : "#ff6b6b"}`, color:gc.weekly_reset ? "#4CAF50" : "#ff6b6b", borderRadius:6, padding:"4px 12px", fontSize:10, fontWeight:700, cursor:"pointer" }}>
                        {gc.weekly_reset ? "BẬT" : "TẮT"}
                      </button>
                    </div>
                  )}

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {(gc.rewards || []).map((r, i) => (
                      <div key={i} style={{ background:"#12121a", borderRadius:10, padding:"10px 12px" }}>
                        <p style={{ color:i===0 ? "#FFD700" : i===1 ? "#C0C0C0" : "#CD7F32", fontSize:11, fontWeight:800, margin:"0 0 6px" }}>
                          {i===0 ? "🥇" : i===1 ? "🥈" : "🥉"} Top {r.rank}
                        </p>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <input type="number" value={r.points} onChange={e => updateReward("games", g.key, i, "points", e.target.value)} style={{ width:"100%", background:"#2a2a38", border:"1px solid #333", borderRadius:6, padding:"6px 8px", color:"white", fontSize:13, fontWeight:700, textAlign:"center" }} />
                          <span style={{ color:"#666", fontSize:10, whiteSpace:"nowrap" }}>điểm thưởng</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {topOpen && (
        <div onClick={() => setTopOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:900, maxHeight:"86vh", background:"#111118", border:"1px solid #333", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #222", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ color:"white", margin:0, fontSize:18 }}>🏆 {topTitle}</h3>
              <button onClick={() => setTopOpen(false)} style={{ background:"transparent", border:"none", color:"#888", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            <div style={{ maxHeight:"72vh", overflowY:"auto" }}>
              {topLoading ? (
                <p style={{ color:"#888", padding:20 }}>Đang tải...</p>
              ) : topRows.length === 0 ? (
                <p style={{ color:"#666", padding:20, textAlign:"center" }}>Chưa có dữ liệu</p>
              ) : (
                topRows.map(r => (
                  <div key={`${r.rank}-${r.user_id}`} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px", borderBottom:"1px solid #1f1f28" }}>
                    <div style={{ width:48, color:r.rank <= 3 ? "#FFD700" : "#888", fontWeight:900 }}>
                      ${r.rank === 1 ? "🥇 Top 1" : r.rank === 2 ? "🥈 Top 2" : r.rank === 3 ? "🥉 Top 3" : `Top ${r.rank}`}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"white", fontWeight:800 }}>{r.player_name || "Cing iu"}</div>
                      <div style={{ color:"#666", fontSize:11 }}>{r.user_id}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:"#FFD700", fontWeight:900 }}>
                        {Number(r.value || 0).toLocaleString("vi-VN")} {r.value_label}
                      </div>
                      {r.winRate !== undefined && (
                        <div style={{ color:"#888", fontSize:11 }}>
                          {r.winRate}% thắng · {r.total_games || 0} ván
                        </div>
                      )}
                      {r.current_streak !== undefined && (
                        <div style={{ color:"#888", fontSize:11 }}>
                          Chuỗi hiện tại: {r.current_streak}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
