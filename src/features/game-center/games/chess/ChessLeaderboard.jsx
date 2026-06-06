import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";

function getPhone() {
  const sources = [
    useRuntimeCustomerIdentityStore.getState().identity?.phone,
    useAuthStore.getState().profile?.phone,
  ];
  for (const src of sources) {
    if (!src || src === "pending") continue;
    const n = src.replace(/\D/g,"").replace(/^84/,"0");
    if (n.length >= 9) return n;
  }
  return "";
}

const MEDAL = ["🥇","🥈","🥉"];

export default function ChessLeaderboard({ onClose }) {
  const [tab,     setTab]     = useState("wins");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const profilePhone = useAuthStore(s => s.profile?.phone);

  const myPhone = (() => {
    for (const src of [runtimePhone, profilePhone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();

  const fetchData = () => {
    setLoading(true);
    apiClient.get("/game/chess/leaderboard")
      .then(r => setData(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || "https://cing-backend-production.up.railway.app";
    const s = io(`${GAME_SERVER}/chess`, { transports:["websocket"] });
    s.on("chess:leaderboard_updated", fetchData);
    return () => s.disconnect();
  }, []);

  const list   = tab === "wins" ? data?.topWins : data?.topStreak;
  const myEntry = list?.find(e => String(e.user_id) === myPhone);
  const myRank  = myEntry?.rank;

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100 }}/>
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:101,
        background:"linear-gradient(180deg,#0d0d14,#080810)",
        borderRadius:"24px 24px 0 0", maxHeight:"88vh",
        display:"flex", flexDirection:"column",
        border:"1px solid rgba(255,215,0,0.15)" }}>

        <div style={{ width:40, height:4, background:"rgba(255,255,255,0.15)", borderRadius:2, margin:"12px auto 4px" }}/>

        {/* Header */}
        <div style={{ padding:"12px 20px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <p style={{ color:"#FFD700", fontSize:10, fontWeight:800, margin:"0 0 2px", letterSpacing:3 }}>BẢNG XẾP HẠNG</p>
              <p style={{ color:"white", fontSize:17, fontWeight:900, margin:0 }}>♟ Kỳ thủ cờ vua</p>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"white", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:8, paddingBottom:12 }}>
            {[
              { key:"wins",   label:"🏆 Thắng nhiều nhất" },
              { key:"streak", label:"🔥 Chuỗi thắng dài nhất" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex:1, padding:"8px", borderRadius:10,
                border: tab===t.key ? "none" : "1px solid rgba(255,255,255,0.1)",
                background: tab===t.key ? "linear-gradient(135deg,#8B6914,#FFD700)" : "rgba(255,255,255,0.04)",
                color: tab===t.key ? "#1a0a00" : "#888",
                fontSize:11, fontWeight:tab===t.key?900:500, cursor:"pointer"
              }}>{t.label}</button>
            ))}
          </div>

          {/* My rank */}
          {myRank && myEntry && (
            <div style={{ marginBottom:12, padding:"10px 14px", background:"rgba(212,83,28,0.12)", borderRadius:12, border:"1px solid rgba(212,83,28,0.3)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:10, margin:"0 0 2px" }}>Hạng của bạn</p>
                <p style={{ color:"white", fontSize:13, fontWeight:800, margin:0 }}>{myEntry.name}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#D4531C", fontSize:20, fontWeight:900, margin:0 }}>#{myRank}</p>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, margin:0 }}>
                  {tab==="wins" ? `${myEntry.wins} thắng` : `${myEntry.best_streak} chuỗi`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ overflowY:"auto", flex:1, WebkitOverflowScrolling:"touch", padding:"12px 16px 20px" }}>
          {loading ? (
            <p style={{ color:"#666", textAlign:"center", padding:40 }}>Đang tải...</p>
          ) : !list?.length ? (
            <div style={{ textAlign:"center", padding:40 }}>
              <p style={{ fontSize:36, margin:"0 0 8px" }}>♟</p>
              <p style={{ color:"#666" }}>Chưa có dữ liệu. Hãy chơi để xếp hạng!</p>
            </div>
          ) : list.map((entry, i) => {
            const isMe = myPhone && String(entry.user_id) === myPhone;
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px", borderRadius:12, marginBottom:6,
                background: isMe ? "rgba(212,83,28,0.08)" : i<3 ? (i===0?"rgba(255,215,0,0.08)":i===1?"rgba(192,192,192,0.05)":"rgba(205,127,50,0.05)") : "rgba(255,255,255,0.02)",
                border: `1px solid ${isMe?"rgba(212,83,28,0.3)":i<3?(i===0?"rgba(255,215,0,0.25)":i===1?"rgba(192,192,192,0.15)":"rgba(205,127,50,0.15)"):"rgba(255,255,255,0.04)"}`,
              }}>
                <span style={{ fontSize:i<3?20:13, width:28, textAlign:"center",
                  color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"rgba(255,255,255,0.3)", fontWeight:700 }}>
                  {i<3 ? MEDAL[i] : `Top ${i+1}`}
                </span>
                <div style={{ width:34, height:34, borderRadius:17, flexShrink:0, overflow:"hidden",
                  background:"linear-gradient(135deg,#1a0a2e,#2d1254)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, fontWeight:900, color:"rgba(255,255,255,0.4)" }}>
                  {entry.avatar
                    ? <img src={entry.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : (entry.name||"?")[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:isMe?"#FFD700":"white", fontSize:13, fontWeight:700, margin:0,
                    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                    {entry.name}{isMe?" (bạn)":""}
                  </p>
                  <p style={{ color:"#666", fontSize:10, margin:0 }}>
                    {tab==="wins"
                      ? `${entry.total_games} trận · ${entry.winRate}% thắng`
                      : `${entry.total_games} trận · chuỗi hiện tại ${entry.current_streak}`}
                  </p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"rgba(255,215,0,0.6)", fontSize:16, fontWeight:900, margin:0 }}>
                    {tab==="wins" ? entry.wins : entry.best_streak}
                  </p>
                  <p style={{ color:"rgba(255,255,255,0.25)", fontSize:9, margin:0 }}>
                    {tab==="wins" ? "thắng" : "liên tiếp"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
