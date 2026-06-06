import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

export default function AdminGames({ token }) {
  const [games, setGames]         = useState([]);
  const [scores, setScores]       = useState({});
  const [loading, setLoading]     = useState(true);
  const [adjustUser, setAdjustUser] = useState("");
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [msg, setMsg]             = useState("");
  const [activeGame, setActiveGame] = useState(null);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Lấy alltime games config để biết có bao nhiêu game
    apiClient.get("/game/leaderboard/alltime-games")
      .then(r => {
        const data = r.data?.data || [];
        setGames(data);
        if (data.length > 0) setActiveGame(data[0].game_key);
        // Fetch scores cho từng game
        data.forEach(g => {
          apiClient.get(`/leaderboard/top-games/${g.game_key}`, { headers: h })
            .then(r2 => setScores(prev => ({ ...prev, [g.game_key]: r2.data?.data || [] })))
            .catch(() => {});
        });
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const adjustPlays = async () => {
    if (!adjustUser) return;
    try {
      await apiClient.post("/admin/players/adjust-plays",
        { user_id: adjustUser.replace(/\D/g,""), amount: Number(adjustAmount) }, { headers: h });
      setMsg(`✅ Đã ${Number(adjustAmount)>0?"cộng":"trừ"} ${Math.abs(adjustAmount)} lượt cho ${adjustUser}`);
    } catch(e) {
      setMsg("❌ " + (e.response?.data?.message || e.message));
    }
    setTimeout(()=>setMsg(""),3000);
  };

  const currentGame = games.find(g => g.game_key === activeGame);
  const currentScores = scores[activeGame] || [];

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>🎮 Quản lý Games</h2>

      {/* Adjust plays */}
      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
        border:"1px solid #2a2a38", marginBottom:20 }}>
        <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:1,
          margin:"0 0 12px", textTransform:"uppercase" }}>🎯 Điều chỉnh lượt chơi</p>
        {msg && <div style={{ color:msg.includes("✅")?"#4CAF50":"#f44336",
          fontSize:13, marginBottom:10 }}>{msg}</div>}
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <input placeholder="SĐT người chơi" value={adjustUser}
            onChange={e=>setAdjustUser(e.target.value)}
            style={{ flex:2, background:"#2a2a38", border:"1px solid #333",
              borderRadius:8, padding:"9px 12px", color:"white", fontSize:13 }}/>
          <input type="number" value={adjustAmount} onChange={e=>setAdjustAmount(e.target.value)}
            style={{ flex:1, background:"#2a2a38", border:"1px solid #333",
              borderRadius:8, padding:"9px 12px", color:"white", fontSize:13, textAlign:"center" }}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <button onClick={()=>{setAdjustAmount(Math.abs(adjustAmount));adjustPlays();}}
            style={{ background:"rgba(76,175,80,0.2)", border:"1px solid #4CAF50",
              color:"#4CAF50", borderRadius:8, padding:"10px", fontWeight:700, cursor:"pointer" }}>
            ➕ Cộng lượt
          </button>
          <button onClick={()=>{setAdjustAmount(-Math.abs(adjustAmount));adjustPlays();}}
            style={{ background:"rgba(244,67,54,0.2)", border:"1px solid #f44336",
              color:"#f44336", borderRadius:8, padding:"10px", fontWeight:700, cursor:"pointer" }}>
            ➖ Trừ lượt
          </button>
        </div>
      </div>

      {/* Game tabs */}
      {loading ? (
        <p style={{ color:"#666" }}>Đang tải...</p>
      ) : (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {games.map(g => (
              <button key={g.game_key} onClick={()=>setActiveGame(g.game_key)} style={{
                background: activeGame===g.game_key ? "rgba(212,83,28,0.2)" : "#1a1a24",
                border: `1px solid ${activeGame===g.game_key ? "#D4531C" : "#2a2a38"}`,
                color: activeGame===g.game_key ? "#D4531C" : "#888",
                borderRadius:10, padding:"8px 16px", fontSize:12,
                fontWeight:700, cursor:"pointer"
              }}>
                {g.icon} {g.display_name}
              </button>
            ))}
          </div>

          {currentGame && (
            <div style={{ background:"#1a1a24", borderRadius:14, border:"1px solid #2a2a38" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid #2a2a38",
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ color:"white", fontWeight:800, margin:0 }}>
                  {currentGame.icon} {currentGame.display_name} — Top {currentScores.length}
                </p>
              </div>
              <div style={{ maxHeight:400, overflowY:"auto" }}>
                {currentScores.length === 0 ? (
                  <p style={{ color:"#666", padding:20, textAlign:"center" }}>Chưa có dữ liệu</p>
                ) : currentScores.map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                    padding:"10px 20px", borderBottom:"1px solid #12121a" }}>
                    <span style={{ color: i<3?"#FFD700":"#666", fontSize:13,
                      fontWeight:700, width:28, textAlign:"center" }}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`Top ${i+1}`}
                    </span>
                    <div style={{ width:32, height:32, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg,#1a0a2e,#2d1254)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:900, color:"rgba(255,255,255,0.4)", overflow:"hidden" }}>
                      {s.avatar
                        ? <img src={s.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : (s.player_name||"?")[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>{s.player_name}</p>
                      <p style={{ color:"#666", fontSize:11, margin:0 }}>{s.user_id}</p>
                    </div>
                    <p style={{ color:"#FFD700", fontSize:14, fontWeight:900, margin:0 }}>
                      {(s.score||0).toLocaleString()} điểm
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
