import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const GAMES = [
  { key:"black-pearl-rush", name:"Bay cùng trân châu", icon:"🎮" },
];

export default function AdminGames({ token }) {
  const [config, setConfig] = useState({ enabled: true, maintenance: false });
  const [players, setPlayers] = useState([]);
  const [msg, setMsg] = useState("");
  const [adjustUser, setAdjustUser] = useState("");
  const [adjustAmount, setAdjustAmount] = useState(0);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/leaderboard/top-spenders?period=alltime&limit=10", { headers: h })
      .then(r => setPlayers(r.data?.data || [])).catch(()=>{});
  }, []);

  const adjustPlays = async () => {
    if (!adjustUser) return;
    try {
      await apiClient.post("/game/admin/adjust-plays",
        { user_id: adjustUser, amount: Number(adjustAmount) }, { headers: h });
      setMsg(`✅ Đã cộng ${adjustAmount} lượt cho ${adjustUser}`);
    } catch(e) {
      // Fallback: update truc tiep Supabase qua backend
      setMsg("⚠️ " + (e.response?.data?.message || e.message));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>🎮 Quản lý Games</h2>
      
      {/* Game list */}
      {GAMES.map(g => (
        <div key={g.key} style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
          marginBottom:16, border:"1px solid #2a2a38" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:28 }}>{g.icon}</span>
              <div>
                <p style={{ color:"white", fontWeight:800, margin:0 }}>{g.name}</p>
                <p style={{ color:"#666", fontSize:12, margin:"2px 0 0" }}>key: {g.key}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setConfig(c=>({...c,enabled:!c.enabled}))}
                style={{ background: config.enabled ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)",
                  border: `1px solid ${config.enabled ? "#4CAF50" : "#ff6b6b"}`,
                  color: config.enabled ? "#4CAF50" : "#ff6b6b",
                  borderRadius:8, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>
                {config.enabled ? "🟢 Đang bật" : "🔴 Đang tắt"}
              </button>
              <button onClick={()=>setConfig(c=>({...c,maintenance:!c.maintenance}))}
                style={{ background:"rgba(255,152,0,0.2)", border:"1px solid #FF9800",
                  color:"#FF9800", borderRadius:8, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>
                {config.maintenance ? "🔧 Maintenance" : "⚙️ Bảo trì"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Adjust plays */}
      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
        marginBottom:16, border:"1px solid #2a2a38" }}>
        <p style={{ color:"white", fontWeight:800, margin:"0 0 14px" }}>🎲 Cộng/Trừ lượt chơi</p>
        {msg && <div style={{ color:"#4CAF50", fontSize:13, marginBottom:10 }}>{msg}</div>}
        <div style={{ display:"flex", gap:8 }}>
          <input placeholder="User ID hoặc phone" value={adjustUser}
            onChange={e=>setAdjustUser(e.target.value)}
            style={{ flex:1, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"10px 12px", color:"white", fontSize:13 }}/>
          <input type="number" placeholder="Số lượt (+/-)" value={adjustAmount}
            onChange={e=>setAdjustAmount(e.target.value)}
            style={{ width:120, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"10px 12px", color:"white", fontSize:13, textAlign:"center" }}/>
          <button onClick={adjustPlays}
            style={{ background:"#D4531C", border:"none", color:"white",
              borderRadius:8, padding:"10px 20px", fontWeight:700, cursor:"pointer" }}>
            Áp dụng
          </button>
        </div>
      </div>

      {/* Top players */}
      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
        <p style={{ color:"white", fontWeight:800, margin:"0 0 14px" }}>🏆 Top người chơi</p>
        {players.slice(0,5).map((p,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
            padding:"8px 0", borderBottom:"1px solid #2a2a38" }}>
            <span style={{ color:"#D4531C", fontWeight:900, width:24 }}>#{i+1}</span>
            <span style={{ color:"white", flex:1, fontSize:13 }}>{p.name || p.zalo_name}</span>
            <span style={{ color:"#FFD700", fontSize:12 }}>{(p.total_spent||0).toLocaleString("vi-VN")}đ</span>
          </div>
        ))}
      </div>
    </div>
  );
}
