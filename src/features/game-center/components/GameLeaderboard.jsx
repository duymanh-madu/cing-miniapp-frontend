import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

const MEDAL = ["🥇","🥈","🥉"];

export default function GameLeaderboard({ gameKey, onClose }) {
  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/leaderboard/top-games/${gameKey}`)
      .then(r => {
        setData(r.data?.data || []);
        if (profile?.id) {
          apiClient.get(`/leaderboard/user-rank/${profile.id}`)
            .then(r2 => setMyRank(r2.data?.data))
            .catch(() => {});
        }
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [gameKey]);

  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:100,
      }} />
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:101,
        background:"linear-gradient(180deg,#12071a,#0a0a0f)",
        borderRadius:"24px 24px 0 0",
        maxHeight:"80vh", display:"flex", flexDirection:"column",
        border:"1px solid rgba(255,215,0,0.15)",
      }}>
        {/* Handle */}
        <div style={{ width:40, height:4, background:"rgba(255,255,255,0.15)",
          borderRadius:2, margin:"12px auto 0" }} />

        {/* Header */}
        <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ color:"#FFD700", fontSize:11, fontWeight:800, margin:"0 0 3px", letterSpacing:3 }}>
                TOP 100
              </p>
              <p style={{ color:"white", fontSize:16, fontWeight:900, margin:0 }}>
                {gameKey === "black-pearl-rush" ? "Black Pearl Rush" : gameKey}
              </p>
            </div>
            <button onClick={onClose} style={{
              background:"rgba(255,255,255,0.08)", border:"none", color:"white",
              borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:16,
            }}>✕</button>
          </div>

          {/* My rank */}
          {myRank && (
            <div style={{ marginTop:10, padding:"8px 12px",
              background:"rgba(255,215,0,0.08)", borderRadius:10,
              display:"flex", justifyContent:"space-between", alignItems:"center",
              border:"1px solid rgba(255,215,0,0.15)" }}>
              <span style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Hang cua ban</span>
              <span style={{ color:"#FFD700", fontSize:14, fontWeight:900 }}>
                #{myRank.rank || "—"}
              </span>
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ overflowY:"auto", flex:1, WebkitOverflowScrolling:"touch" }}>
          {loading ? (
            <div style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)" }}>
              Dang tai...
            </div>
          ) : data.length === 0 ? (
            <div style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🎮</div>
              <p style={{ fontSize:13 }}>Chua co du lieu. Hay choi de xep hang!</p>
            </div>
          ) : data.map((entry, idx) => (
            <div key={idx} style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"12px 20px",
              borderBottom:"1px solid rgba(255,255,255,0.04)",
              background: idx < 3 ? "rgba(255,215,0,0.03)" : "transparent",
            }}>
              <div style={{ width:32, textAlign:"center", flexShrink:0 }}>
                {idx < 3
                  ? <span style={{ fontSize:20 }}>{MEDAL[idx]}</span>
                  : <span style={{ color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:700 }}>
                      {idx+1}
                    </span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0,
                  overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                  {entry.player_name || entry.name || entry.user_id || "An danh"}
                </p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ color:"#FFD700", fontSize:14, fontWeight:900, margin:0 }}>
                  {(entry.score || entry.high_score || 0).toLocaleString()}
                </p>
                <p style={{ color:"rgba(255,255,255,0.25)", fontSize:10, margin:0 }}>diem</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
