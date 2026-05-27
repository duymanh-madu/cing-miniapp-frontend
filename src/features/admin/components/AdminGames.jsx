import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const GAMES = [
  { key:"black-pearl-rush", name:"Bay cùng trân châu", icon:"🎮" },
];

export default function AdminGames({ token }) {
  const [scores, setScores]         = useState({});
  const [adjustUser, setAdjustUser] = useState("");
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [msg, setMsg]               = useState("");
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    GAMES.forEach(g => {
      apiClient.get(`/leaderboard/top-games/${g.key}`, { headers: h })
        .then(r => setScores(prev => ({ ...prev, [g.key]: r.data?.data || [] })))
        .catch(() => {});
    });
  }, []);

  const adjustPlays = async () => {
    if (!adjustUser) return;
    try {
      await apiClient.post("/admin/players/adjust-plays",
        { user_id: adjustUser.replace(/\D/g,""), amount: Number(adjustAmount) }, { headers: h });
      setMsg(`✅ Đã ${Number(adjustAmount) > 0 ? "cộng" : "trừ"} ${Math.abs(adjustAmount)} lượt cho ${adjustUser}`);
    } catch(e) {
      setMsg("❌ " + (e.response?.data?.message || e.message));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>🎮 Quản lý Games</h2>

      {/* Adjust plays */}
      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
        marginBottom:20, border:"1px solid #2a2a38" }}>
        <p style={{ color:"white", fontWeight:800, margin:"0 0 14px" }}>🎲 Cộng/Trừ lượt chơi</p>
        {msg && <div style={{ color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b",
          fontSize:13, marginBottom:10 }}>{msg}</div>}
        <div style={{ display:"flex", gap:8 }}>
          <input placeholder="Số điện thoại" value={adjustUser}
            onChange={e => setAdjustUser(e.target.value)}
            style={{ flex:1, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"10px 12px", color:"white", fontSize:13 }}/>
          <input type="number" placeholder="Số lượt" value={adjustAmount}
            onChange={e => setAdjustAmount(e.target.value)}
            style={{ width:100, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"10px 12px", color:"white", fontSize:13, textAlign:"center" }}/>
          <button onClick={() => { setAdjustAmount(Math.abs(adjustAmount)); adjustPlays(); }}
            style={{ background:"rgba(76,175,80,0.2)", border:"1px solid #4CAF50",
              color:"#4CAF50", borderRadius:8, padding:"10px 16px", fontWeight:700, cursor:"pointer" }}>
            +Cộng
          </button>
          <button onClick={() => { setAdjustAmount(-Math.abs(adjustAmount)); adjustPlays(); }}
            style={{ background:"rgba(255,80,80,0.2)", border:"1px solid #ff6b6b",
              color:"#ff6b6b", borderRadius:8, padding:"10px 16px", fontWeight:700, cursor:"pointer" }}>
            -Trừ
          </button>
        </div>
      </div>

      {/* Leaderboard theo từng game */}
      {GAMES.map(g => (
        <div key={g.key} style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
          marginBottom:16, border:"1px solid #2a2a38" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:24 }}>{g.icon}</span>
            <div>
              <p style={{ color:"white", fontWeight:800, margin:0 }}>{g.name}</p>
              <p style={{ color:"#666", fontSize:11, margin:"2px 0 0" }}>
                Bảng xếp hạng điểm cao nhất — {scores[g.key]?.length || 0} người chơi
              </p>
            </div>
          </div>

          {/* Top 10 */}
          <div style={{ borderTop:"1px solid #2a2a38", paddingTop:12 }}>
            <p style={{ color:"#666", fontSize:11, fontWeight:700, letterSpacing:1,
              margin:"0 0 10px", textTransform:"uppercase" }}>Top người chơi</p>
            {(scores[g.key] || []).length === 0 ? (
              <p style={{ color:"#444", fontSize:13 }}>Chưa có dữ liệu</p>
            ) : (scores[g.key] || []).slice(0, 10).map((p, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                padding:"8px 0", borderBottom:"1px solid #1a1a24" }}>
                <span style={{ color: i < 3 ? "#FFD700" : "#444",
                  fontWeight:900, width:24, fontSize:14 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                </span>
                <span style={{ color:"white", flex:1, fontSize:13 }}>
                  {p.player_name || p.name || p.user_id}
                </span>
                <span style={{ color:"#FFD700", fontSize:13, fontWeight:800 }}>
                  {(p.score || p.high_score || 0).toLocaleString("vi-VN")} điểm
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
