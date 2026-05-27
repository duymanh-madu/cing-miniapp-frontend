import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

export default function GamePlaysCard({ onPlaysUpdate }) {
  const profile = useAuthStore(s => s.profile);
  const [plays, setPlays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [buying, setBuying] = useState(false);
  const [buyMsg, setBuyMsg] = useState("");

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return; }
    apiClient.get(`/leaderboard/user-rank/${profile.id}`)
      .then(r => {
        const p = r.data?.data;
        const gamePlays = p?.game_plays ?? 3;
        setPlays(gamePlays);
        setPoints(p?.total_points || 0);
        onPlaysUpdate?.(gamePlays);
      })
      .catch(() => { setPlays(3); onPlaysUpdate?.(3); })
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const buyPlay = async (qty) => {
    if (!profile?.id) return;
    setBuying(true); setBuyMsg("");
    try {
      const res = await apiClient.post("/points/buy-plays", { user_id: profile.id, quantity: qty });
      if (res.data?.success) {
        const newPlays = res.data.data.new_plays;
        setPlays(newPlays);
        setPoints(res.data.data.remaining_points);
        onPlaysUpdate?.(newPlays);
        setBuyMsg("✅ " + res.data.message);
      } else {
        setBuyMsg("❌ " + res.data.message);
      }
    } catch(e) {
      setBuyMsg("❌ " + (e.response?.data?.message || "Lỗi mua lượt chơi"));
    }
    setBuying(false);
    setTimeout(() => setBuyMsg(""), 3000);
  };

    const bars = [1,2,3,4,5];

  return (
    <div style={{
      margin:"0 16px 16px",
      background:"linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,140,0,0.05))",
      border:"1px solid rgba(255,215,0,0.2)",
      borderRadius:18, overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        padding:"14px 16px 10px",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>🎮</span>
          <span style={{ color:"white", fontSize:14, fontWeight:800 }}>Lượt chơi</span>
        </div>
        <div style={{
          background: plays > 0 ? "rgba(0,255,100,0.15)" : "rgba(255,80,80,0.15)",
          border: `1px solid ${plays > 0 ? "rgba(0,255,100,0.3)" : "rgba(255,80,80,0.3)"}`,
          borderRadius:20, padding:"3px 12px",
          color: plays > 0 ? "#00ff64" : "#ff6464",
          fontSize:12, fontWeight:800,
        }}>
          {loading ? "..." : plays > 0 ? `${plays} lượt còn lại` : "Hết lượt"}
        </div>
      </div>

      {/* Plays bar */}
      <div style={{ padding:"12px 16px 8px" }}>
        <div style={{ display:"flex", gap:5, marginBottom:12 }}>
          {bars.map(i => (
            <div key={i} style={{
              flex:1, height:8, borderRadius:4,
              background: i <= (plays||0)
                ? "linear-gradient(90deg,#FFD700,#FFA500)"
                : "rgba(255,255,255,0.1)",
              transition:"background 0.3s",
            }}/>
          ))}
        </div>

        {/* How to earn */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14 }}>🎁</span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>
              Tặng <b style={{color:"#FFD700"}}>3 lượt miễn phí</b> khi kích hoạt tài khoản lần đầu
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14 }}>🧋</span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>
              Mỗi <b style={{color:"#FFD700"}}>20.000đ</b> chi tiêu đặt hàng → nhận thêm <b style={{color:"#FFD700"}}>1 lượt chơi</b>
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14 }}>⚡</span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>
              1 lượt = 1 ván game bất kỳ trong Game Center
            </span>
          </div>
        </div>
      </div>

      {/* CTA if out of plays */}
      {plays === 0 && !loading && (
        <div style={{
          margin:"0 12px 12px",
          background:"rgba(212,83,28,0.15)",
          border:"1px solid rgba(212,83,28,0.3)",
          borderRadius:12, padding:"10px 14px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <span style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>
            Đặt hàng để nhận thêm lượt chơi
          </span>
          <button
            onClick={() => window.location.hash = "/menu"}
            style={{
              background:"#D4531C", color:"white", border:"none",
              borderRadius:8, padding:"5px 12px", fontSize:11,
              fontWeight:700, cursor:"pointer",
            }}>
            Đặt ngay
          </button>
        </div>
      )}
      {/* MUA LUOT CHOI */}
      <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,215,0,0.1)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, margin:0 }}>
            💎 Điểm tích lũy: <strong style={{ color:"#FFD700" }}>{points}</strong> điểm
          </p>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, margin:0 }}>5 điểm = 1 lượt</p>
        </div>
        {buyMsg && <p style={{ color: buyMsg.includes("✅") ? "#4CAF50" : "#ff6b6b", fontSize:11, margin:"0 0 8px" }}>{buyMsg}</p>}
        <div style={{ display:"flex", gap:6 }}>
          {[1,3,5].map(qty => (
            <button key={qty} onClick={() => buyPlay(qty)} disabled={buying || points < qty * 5}
              style={{ flex:1, padding:"7px 0", borderRadius:10, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
                background: points >= qty * 5 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                color: points >= qty * 5 ? "#FFD700" : "rgba(255,255,255,0.2)" }}>
              +{qty} lượt<br/>
              <span style={{ fontSize:9, fontWeight:400 }}>({qty*5} điểm)</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
