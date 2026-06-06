import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const PERIODS = [
  { key:"weekly",    label:"Tuần",       icon:"📅", resetInfo:"Thứ Hai hàng tuần" },
  { key:"monthly",   label:"Tháng",      icon:"🗓", resetInfo:"Ngày 1 hàng tháng" },
  { key:"yearly",    label:"Năm",         icon:"📆", resetInfo:"Ngày 1 tháng 1 hàng năm" },
  { key:"custom",    label:"Tuỳ chỉnh",  icon:"🎯", resetInfo:"Theo cấu hình admin" },
  { key:"alltime",   label:"Tất cả",     icon:"🏆", resetInfo:"Không reset" },
];

const GAMES = [
  { key:"black-pearl-rush",       label:"Bay cùng trân châu",                    icon:"🫧" },
  { key:"chess-wins",             label:"Kỳ thủ cờ vua — Thắng nhiều nhất",     icon:"♟️" },
  { key:"chess-streak",           label:"Kỳ thủ cờ vua — Chuỗi thắng dài nhất", icon:"🔥" },
];

export default function AdminLeaderboard({ token }) {
  const [config, setConfig]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [distributing, setDistributing] = useState("");
  const [resetting, setResetting]       = useState("");
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/admin/leaderboard/config", { headers: h })
      .then(r => setConfig(r.data?.data || defaultConfig()))
      .catch(() => setConfig(defaultConfig()))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/admin/leaderboard/config", { leaderboard_config: config }, { headers: h });
      setMsg("✅ Đã lưu cấu hình!");
    } catch(e) { setMsg("❌ " + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const distribute = async (type, period, game_key) => {
    const key = type + (period || game_key);
    setDistributing(key);
    try {
      const res = await apiClient.post("/admin/leaderboard/distribute-rewards",
        { type, period, game_key }, { headers: h });
      const results = res.data?.data || [];
      setMsg(`✅ Đã phát thưởng: ${results.map(r => `Top${r.rank} ${r.name} +${r.points} điểm`).join(", ")}`);
    } catch(e) { setMsg("❌ " + (e.response?.data?.error || e.message)); }
    setDistributing("");
    setTimeout(() => setMsg(""), 6000);
  };

  const manualReset = async () => {
    if (!window.confirm("Reset BXH tuần ngay và phát thưởng?")) return;
    try {
      await apiClient.post("/admin/leaderboard/manual-weekly-reset", {}, { headers:h });
      setMsg("✅ Đang reset BXH tuần...");
    } catch(e) { setMsg("❌ " + e.message); }
    setTimeout(() => setMsg(""), 5000);
  };

  const resetGame = async (game_key) => {
    if (!window.confirm(`Reset bảng xếp hạng ${game_key}? #100 sẽ được lưu archive.`)) return;
    setResetting(game_key);
    try {
      const res = await apiClient.post("/admin/leaderboard/reset-game-scores",
        { game_key }, { headers: h });
      setMsg(`✅ ${res.data?.message}`);
    } catch(e) { setMsg("❌ " + e.message); }
    setResetting("");
    setTimeout(() => setMsg(""), 4000);
  };

  const updateReward = (section, key, rankIdx, field, val) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section][key].rewards[rankIdx][field] = field === "points" ? Number(val) : val;
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

  const toggleWeeklyReset = (game_key) => {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.games[game_key].weekly_reset = !next.games[game_key].weekly_reset;
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
            Cấu hình phần thưởng và reset bảng xếp hạng
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={manualReset}
            style={{ background:"rgba(255,152,0,0.15)", border:"1px solid #FF9800",
              color:"#FF9800", borderRadius:10, padding:"10px 16px",
              fontWeight:800, cursor:"pointer", fontSize:12 }}>
            🔄 Reset tuần ngay
          </button>
          <button onClick={save} disabled={saving}
            style={{ background:"#D4531C", border:"none", color:"white",
              borderRadius:10, padding:"10px 24px", fontWeight:800, cursor:"pointer" }}>
            {saving ? "Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ background: msg.includes("✅") ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
          border: `1px solid ${msg.includes("✅") ? "#4CAF50" : "#f44336"}`,
          borderRadius:10, padding:"12px 16px", marginBottom:16,
          color: msg.includes("✅") ? "#4CAF50" : "#f44336", fontSize:13 }}>
          {msg}
        </div>
      )}

      {/* SPENDING LEADERBOARD */}
      <div style={{ marginBottom:24 }}>
        <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:2,
          margin:"0 0 12px", textTransform:"uppercase" }}>
          💰 Bảng xếp hạng tiêu dùng
        </p>

        {PERIODS.map(p => {
          const pc = config?.spending?.[p.key] || {};
          const isEnabled = pc.enabled;
          return (
            <div key={p.key} style={{ background:"#1a1a24", borderRadius:14,
              padding:"16px 20px", marginBottom:12, border:`1px solid ${isEnabled ? "#D4531C44" : "#2a2a38"}` }}>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{p.icon}</span>
                  <div>
                    <p style={{ color:"white", fontWeight:800, margin:0 }}>
                      Bảng xếp hạng {p.label}
                    </p>
                    <p style={{ color:"#666", fontSize:11, margin:"2px 0 0" }}>
                      {p.resetInfo}
                    </p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {p.key !== "alltime" && (
                    <button
                      onClick={() => distribute("spending", p.key, null)}
                      disabled={!isEnabled || distributing === "spending" + p.key}
                      style={{ background: isEnabled ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isEnabled ? "#FFD700" : "#333"}`,
                        color: isEnabled ? "#FFD700" : "#444",
                        borderRadius:8, padding:"6px 12px", fontSize:11,
                        fontWeight:700, cursor: isEnabled ? "pointer" : "default" }}>
                      {distributing === "spending" + p.key ? "Đang phát..." : "🎁 Phát thưởng"}
                    </button>
                  )}
                  <button onClick={() => toggleEnabled("spending", p.key)}
                    style={{ background: isEnabled ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)",
                      border: `1px solid ${isEnabled ? "#4CAF50" : "#ff6b6b"}`,
                      color: isEnabled ? "#4CAF50" : "#ff6b6b",
                      borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    {isEnabled ? "BẬT" : "TẮT"}
                  </button>
                </div>
              </div>

              {/* Rewards config */}
              {isEnabled && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {(pc.rewards || []).map((r, i) => (
                    <div key={i} style={{ background:"#12121a", borderRadius:10, padding:"10px 12px" }}>
                      <p style={{ color: i===0?"#FFD700":i===1?"#C0C0C0":"#CD7F32",
                        fontSize:11, fontWeight:800, margin:"0 0 6px" }}>
                        {i===0?"🥇":i===1?"🥈":"🥉"} Top {r.rank}
                      </p>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input type="number" value={r.points}
                          onChange={e => updateReward("spending", p.key, i, "points", e.target.value)}
                          style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                            borderRadius:6, padding:"6px 8px", color:"white",
                            fontSize:13, fontWeight:700, textAlign:"center" }}/>
                        <span style={{ color:"#666", fontSize:10, whiteSpace:"nowrap" }}>điểm</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GAME LEADERBOARD */}
      <div>
        <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:2,
          margin:"0 0 12px", textTransform:"uppercase" }}>
          🎮 Bảng xếp hạng game
        </p>

        {GAMES.map(g => {
          const gc = config?.games?.[g.key] || {};
          const isEnabled = gc.enabled;
          return (
            <div key={g.key} style={{ background:"#1a1a24", borderRadius:14,
              padding:"16px 20px", marginBottom:12,
              border:`1px solid ${isEnabled ? "#7c3aed44" : "#2a2a38"}` }}>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{g.icon}</span>
                  <div>
                    <p style={{ color:"white", fontWeight:800, margin:0 }}>{g.label}</p>
                    <p style={{ color:"#666", fontSize:11, margin:"2px 0 0" }}>
                      {gc.weekly_reset ? "Reset mỗi thứ Hai" : "Không reset"}
                    </p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <button onClick={() => distribute("game", null, g.key)}
                    disabled={!isEnabled || distributing === "game" + g.key}
                    style={{ background: isEnabled ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isEnabled ? "#FFD700" : "#333"}`,
                      color: isEnabled ? "#FFD700" : "#444",
                      borderRadius:8, padding:"6px 12px", fontSize:11,
                      fontWeight:700, cursor: isEnabled ? "pointer" : "default" }}>
                    {distributing === "game" + g.key ? "Đang phát..." : "🎁 Phát thưởng"}
                  </button>
                  <button onClick={() => resetGame(g.key)}
                    disabled={resetting === g.key}
                    style={{ background:"rgba(244,67,54,0.15)", border:"1px solid #f44336",
                      color:"#f44336", borderRadius:8, padding:"6px 12px",
                      fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    {resetting === g.key ? "Đang reset..." : "🔄 Reset tuần"}
                  </button>
                  <button onClick={() => toggleEnabled("games", g.key)}
                    style={{ background: isEnabled ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)",
                      border: `1px solid ${isEnabled ? "#4CAF50" : "#ff6b6b"}`,
                      color: isEnabled ? "#4CAF50" : "#ff6b6b",
                      borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    {isEnabled ? "BẬT" : "TẮT"}
                  </button>
                </div>
              </div>

              {/* Weekly reset toggle */}
              {isEnabled && (
                <>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 0", borderBottom:"1px solid #2a2a38", marginBottom:10 }}>
                    <p style={{ color:"#888", fontSize:12, margin:0 }}>
                      🔄 Auto reset mỗi tuần (Thứ Hai 0:00)
                    </p>
                    <button onClick={() => toggleWeeklyReset(g.key)}
                      style={{ background: gc.weekly_reset ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)",
                        border: `1px solid ${gc.weekly_reset ? "#4CAF50" : "#ff6b6b"}`,
                        color: gc.weekly_reset ? "#4CAF50" : "#ff6b6b",
                        borderRadius:6, padding:"4px 12px", fontSize:10, fontWeight:700, cursor:"pointer" }}>
                      {gc.weekly_reset ? "BẬT" : "TẮT"}
                    </button>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {(gc.rewards || []).map((r, i) => (
                      <div key={i} style={{ background:"#12121a", borderRadius:10, padding:"10px 12px" }}>
                        <p style={{ color: i===0?"#FFD700":i===1?"#C0C0C0":"#CD7F32",
                          fontSize:11, fontWeight:800, margin:"0 0 6px" }}>
                          {i===0?"🥇":i===1?"🥈":"🥉"} Top {r.rank}
                        </p>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <input type="number" value={r.points}
                            onChange={e => updateReward("games", g.key, i, "points", e.target.value)}
                            style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                              borderRadius:6, padding:"6px 8px", color:"white",
                              fontSize:13, fontWeight:700, textAlign:"center" }}/>
                          <span style={{ color:"#666", fontSize:10, whiteSpace:"nowrap" }}>điểm</span>
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
    </div>
  );
}

function defaultConfig() {
  return {
    spending: {
      weekly:    { enabled:true,  rewards:[{rank:1,points:100,label:"🥇 Top 1 tuần"},{rank:2,points:50,label:"🥈 Top 2 tuần"},{rank:3,points:30,label:"🥉 Top 3 tuần"}] },
      monthly:   { enabled:true,  rewards:[{rank:1,points:200,label:"🥇 Top 1 tháng"},{rank:2,points:100,label:"🥈 Top 2 tháng"},{rank:3,points:60,label:"🥉 Top 3 tháng"}] },
      yearly:    { enabled:false, rewards:[{rank:1,points:500,label:"🥇 Top 1 năm"},{rank:2,points:300,label:"🥈 Top 2 năm"},{rank:3,points:200,label:"🥉 Top 3 năm"}] },
      custom:    { enabled:false, rewards:[{rank:1,points:300,label:"🥇 Vua tiêu dùng"},{rank:2,points:200,label:"🥈 Á quân"},{rank:3,points:100,label:"🥉 Hạng ba"}] },
      alltime:   { enabled:true,  rewards:[] },
    },
    games: {
      "black-pearl-rush": {
        enabled:true, weekly_reset:true, display_name:"Bay cùng trân châu", icon:"🫧",
        rewards:[{rank:1,points:50,label:"🥇 Top 1 tuần"},{rank:2,points:30,label:"🥈 Top 2 tuần"},{rank:3,points:20,label:"🥉 Top 3 tuần"}],
      },
      "chess-wins": {
        enabled:true, weekly_reset:false, display_name:"Kỳ thủ cờ vua — Thắng nhiều nhất", icon:"♟️",
        rewards:[{rank:1,points:100,label:"🥇 Top 1 kỳ thủ"},{rank:2,points:60,label:"🥈 Top 2 kỳ thủ"},{rank:3,points:40,label:"🥉 Top 3 kỳ thủ"}],
      },
      "chess-streak": {
        enabled:true, weekly_reset:false, display_name:"Kỳ thủ cờ vua — Chuỗi thắng dài nhất", icon:"🔥",
        rewards:[{rank:1,points:80,label:"🥇 Chuỗi thắng #1"},{rank:2,points:50,label:"🥈 Chuỗi thắng #2"},{rank:3,points:30,label:"🥉 Chuỗi thắng #3"}],
      },
    },
    chess: {
      enabled: true,
      wins: {
        enabled:true, weekly_reset:false, display_name:"Kỳ thủ cờ vua — Thắng nhiều nhất", icon:"♟️",
        rewards:[{rank:1,points:100,label:"🥇 Top 1 kỳ thủ"},{rank:2,points:60,label:"🥈 Top 2 kỳ thủ"},{rank:3,points:40,label:"🥉 Top 3 kỳ thủ"}],
      },
      streak: {
        enabled:true, weekly_reset:false, display_name:"Kỳ thủ cờ vua — Chuỗi thắng dài nhất", icon:"🔥",
        rewards:[{rank:1,points:80,label:"🥇 Chuỗi thắng #1"},{rank:2,points:50,label:"🥈 Chuỗi thắng #2"},{rank:3,points:30,label:"🥉 Chuỗi thắng #3"}],
      },
    },
  };
}
