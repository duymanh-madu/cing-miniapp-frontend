import { useState } from "react";
import apiClient from "@/infra/api/apiClient";

export default function AdminPlayers({ token }) {
  const [search, setSearch] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [plays, setPlays] = useState(0);
  const h = { Authorization: `Bearer ${token}` };

  const findPlayer = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/membership/${search.replace(/\D/g,"")}`, { headers: h });
      setPlayer(res.data?.data);
    } catch(e) { setMsg("Không tìm thấy"); }
    finally { setLoading(false); }
  };

  const adjustPlays2 = async (amount) => {
    const phone = player?.phone?.replace(/\D/g,"");
    if (!phone) return;
    try {
      // Lay player theo phone tu players table
      const res = await apiClient.post("/game/admin-adjust",
        { phone, amount: Number(amount) }, { headers: h });
      setMsg(`✅ Đã ${amount > 0 ? "cộng" : "trừ"} ${Math.abs(amount)} lượt`);
    } catch(e) {
      setMsg("⚠️ " + (e.response?.data?.message || "Chức năng đang phát triển"));
    }
    setTimeout(()=>setMsg(""),3000);
  };

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>👥 Quản lý người chơi</h2>
      
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <input placeholder="Nhập SĐT hoặc tên" value={search}
          onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&findPlayer()}
          style={{ flex:1, background:"#2a2a38", border:"1px solid #333", borderRadius:10,
            padding:"11px 14px", color:"white", fontSize:14 }}/>
        <button onClick={findPlayer} disabled={loading}
          style={{ background:"#D4531C", border:"none", color:"white",
            borderRadius:10, padding:"11px 24px", fontWeight:700, cursor:"pointer" }}>
          {loading ? "..." : "Tìm kiếm"}
        </button>
      </div>

      {msg && <div style={{ color: msg.includes("✅") ? "#4CAF50" : "#FF9800",
        fontSize:13, marginBottom:14 }}>{msg}</div>}

      {player && (
        <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
          <div style={{ display:"flex", gap:16, marginBottom:16 }}>
            <div style={{ flex:1 }}>
              <p style={{ color:"white", fontSize:18, fontWeight:900, margin:"0 0 4px" }}>{player.name}</p>
              <p style={{ color:"#666", fontSize:12, margin:0 }}>{player.phone}</p>
              <p style={{ color:"#D4531C", fontSize:13, margin:"4px 0 0", fontWeight:700 }}>
                {player.tierName}
              </p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ color:"#FFD700", fontSize:24, fontWeight:900, margin:0 }}>{player.points}</p>
              <p style={{ color:"#666", fontSize:11, margin:0 }}>điểm tích lũy</p>
            </div>
          </div>
          
          <div style={{ borderTop:"1px solid #2a2a38", paddingTop:16 }}>
            <p style={{ color:"white", fontWeight:700, margin:"0 0 10px", fontSize:13 }}>
              🎮 Điều chỉnh lượt chơi
            </p>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" value={plays} onChange={e=>setPlays(e.target.value)}
                style={{ flex:1, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
                  padding:"8px 12px", color:"white", fontSize:13 }}/>
              <button onClick={()=>adjustPlays2(Number(plays))}
                style={{ background:"rgba(76,175,80,0.2)", border:"1px solid #4CAF50",
                  color:"#4CAF50", borderRadius:8, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>
                Cộng
              </button>
              <button onClick={()=>adjustPlays2(-Math.abs(Number(plays)))}
                style={{ background:"rgba(255,80,80,0.2)", border:"1px solid #ff6b6b",
                  color:"#ff6b6b", borderRadius:8, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>
                Trừ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
