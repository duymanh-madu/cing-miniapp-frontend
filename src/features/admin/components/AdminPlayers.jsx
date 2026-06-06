import { useState } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0);

export default function AdminPlayers({ token }) {
  const [search, setSearch]   = useState("");
  const [player, setPlayer]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");
  const [points, setPoints]   = useState(0);
  const [reason, setReason]   = useState("");
  const h = { Authorization: `Bearer ${token}` };

  const findPlayer = async () => {
    if (!search) return;
    setLoading(true); setMsg("");
    try {
      const res = await apiClient.get(`/membership/${search.replace(/\D/g,"")}`, { headers: h });
      setPlayer(res.data?.data);
    } catch(e) { setMsg("❌ Không tìm thấy"); }
    finally { setLoading(false); }
  };

  const adjustPoints = async (amount) => {
    const phone = player?.phone?.replace(/\D/g,"");
    if (!phone) return;
    if (!reason.trim()) { setMsg("⚠️ Vui lòng nhập lý do"); return; }
    try {
      await apiClient.post("/admin/players/adjust-points", {
        user_id: phone, amount: Number(amount), reason: reason.trim()
      }, { headers: h });
      setMsg(`✅ Đã ${amount > 0 ? "cộng" : "trừ"} ${Math.abs(amount)} điểm`);
      setReason("");
      // Refresh player
      const res = await apiClient.get(`/membership/${phone}`, { headers: h });
      setPlayer(res.data?.data);
    } catch(e) {
      setMsg("❌ " + (e.response?.data?.message || e.message));
    }
    setTimeout(()=>setMsg(""),4000);
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
          {loading?"...":"Tìm kiếm"}
        </button>
      </div>

      {msg && <div style={{ color:msg.includes("✅")?"#4CAF50":"#FF9800",
        fontSize:13, marginBottom:14, padding:"8px 12px", background:"rgba(255,255,255,0.05)",
        borderRadius:8 }}>{msg}</div>}

      {player && (
        <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
          {/* Player info */}
          <div style={{ display:"flex", gap:16, marginBottom:20 }}>
            <div style={{ width:52, height:52, borderRadius:26, background:"linear-gradient(135deg,#D4531C,#ff6b35)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"white", flexShrink:0 }}>
              {player.avatar
                ? <img src={player.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                : (player.name||"?")[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ color:"white", fontSize:18, fontWeight:900, margin:"0 0 3px" }}>{player.name}</p>
              <p style={{ color:"Top 888", fontSize:12, margin:"0 0 6px" }}>{player.phone}</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <span style={{ background:"rgba(212,83,28,0.2)", color:"#D4531C",
                  borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
                  {player.tierName || player.tierKey || "member"}
                </span>
                <span style={{ background:"rgba(255,215,0,0.15)", color:"#FFD700",
                  borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
                  ⭐ {fmt(player.points || 0)} điểm
                </span>
                <span style={{ background:"rgba(76,175,80,0.15)", color:"#4CAF50",
                  borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
                  💰 {fmt(player.paymentAmount || 0)}đ
                </span>
              </div>
            </div>
          </div>

          {/* Adjust points */}
          <div style={{ borderTop:"1px solid #2a2a38", paddingTop:16 }}>
            <p style={{ color:"Top 888", fontSize:11, fontWeight:700, letterSpacing:1,
              margin:"0 0 12px", textTransform:"uppercase" }}>⭐ Điều chỉnh điểm tích lũy</p>

            <div style={{ marginBottom:10 }}>
              <p style={{ color:"Top 666", fontSize:11, margin:"0 0 4px" }}>Lý do *</p>
              <input value={reason} onChange={e=>setReason(e.target.value)}
                placeholder="VD: Thưởng sự kiện, bù điểm lỗi hệ thống..."
                style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                  borderRadius:8, padding:"9px 12px", color:"white", fontSize:13,
                  boxSizing:"border-box" }}/>
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
              <input type="number" value={points} onChange={e=>setPoints(e.target.value)}
                min={1} placeholder="Số điểm"
                style={{ flex:1, background:"#2a2a38", border:"1px solid #FFD700",
                  borderRadius:8, padding:"9px 12px", color:"#FFD700",
                  fontSize:16, fontWeight:900, textAlign:"center" }}/>
              <span style={{ color:"Top 888", fontSize:12 }}>điểm</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <button onClick={()=>adjustPoints(Math.abs(points))}
                style={{ background:"rgba(76,175,80,0.2)", border:"1px solid #4CAF50",
                  color:"#4CAF50", borderRadius:10, padding:"12px",
                  fontWeight:800, cursor:"pointer", fontSize:14 }}>
                ➕ Cộng điểm
              </button>
              <button onClick={()=>adjustPoints(-Math.abs(points))}
                style={{ background:"rgba(244,67,54,0.2)", border:"1px solid #f44336",
                  color:"#f44336", borderRadius:10, padding:"12px",
                  fontWeight:800, cursor:"pointer", fontSize:14 }}>
                ➖ Trừ điểm
              </button>
            </div>

            {/* Quick presets */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
              {[10,20,50,100,200,500].map(v => (
                <button key={v} onClick={()=>setPoints(v)}
                  style={{ background: points==v?"rgba(255,215,0,0.2)":"rgba(255,255,255,0.05)",
                    border:`1px solid ${points==v?"#FFD700":"Top 333"}`,
                    color: points==v?"#FFD700":"Top 666",
                    borderRadius:6, padding:"4px 10px", fontSize:11,
                    fontWeight:700, cursor:"pointer" }}>
                  {v}đ
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
