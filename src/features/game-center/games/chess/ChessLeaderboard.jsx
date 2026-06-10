import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const myPhone = (() => {
    for (const src of [runtimePhone, profilePhone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();

  const goProfile = (uid) => {
    if (uid && uid !== myPhone) { onClose(); setTimeout(() => navigate(`/profile/${uid}`), 150); }
  };

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

  const list = tab === "wins" ? (data?.topWins||[]) : (data?.topStreak||[]);
  const top3 = list.slice(0,3);
  const rest = list.slice(3);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200,
      background:"linear-gradient(180deg,#050208 0%,#0d0520 50%,#050208 100%)",
      display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(180deg,#050208,#0d0520)", flexShrink:0,
        paddingTop:"max(env(safe-area-inset-top,0px) + 8px, 48px)",
        paddingBottom:0, borderBottom:"1px solid rgba(255,215,0,0.1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0 16px 12px" }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.1)", color:"white",
            borderRadius:12, width:38, height:38, cursor:"pointer", fontSize:18,
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1, textAlign:"center" }}>
            <p style={{ color:"rgba(255,215,0,0.6)", fontSize:10, fontWeight:800,
              letterSpacing:3, margin:"0 0 2px", textTransform:"uppercase" }}>BXH CỜ VUA</p>
            <h1 style={{ color:"white", fontSize:18, fontWeight:900, margin:0 }}>Kỳ thủ cờ vua ♟️</h1>
          </div>
          <div style={{ width:38 }}/>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, padding:"0 16px 12px" }}>
          {[{k:"wins",label:"🏆 Thắng nhiều nhất"},{k:"streak",label:"🔥 Chuỗi thắng dài nhất"}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              flex:1, padding:"8px", borderRadius:12, border:"none", cursor:"pointer",
              background: tab===t.k ? "linear-gradient(135deg,#D4531C,#ff6b35)" : "rgba(255,255,255,0.06)",
              color:"white", fontSize:12, fontWeight: tab===t.k ? 900 : 500,
              boxShadow: tab===t.k ? "0 4px 12px rgba(212,83,28,0.4)" : "none",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
        {loading ? (
          <div style={{ padding:"60px", textAlign:"center", color:"rgba(255,255,255,0.3)" }}>Đang tải...</div>
        ) : list.length === 0 ? (
          <div style={{ padding:"60px 24px", textAlign:"center", color:"rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>♟️</div>
            <p>Chưa có dữ liệu. Hãy chơi để xếp hạng!</p>
          </div>
        ) : (
          <>
            {/* Podium top 3 */}
            {top3.length >= 1 && (
              <div style={{ padding:"24px 16px 16px", display:"flex", alignItems:"flex-end",
                justifyContent:"center", gap:10 }}>

                {/* Hạng 2 */}
                {top3[1] && (
                  <div onClick={() => goProfile(top3[1].user_id)}
                    style={{ flex:1, textAlign:"center", cursor:"pointer" }}>
                    <div style={{ width:58, height:58, borderRadius:29, margin:"0 auto 6px",
                      border:"2px solid #C0C0C0", overflow:"hidden",
                      background:"linear-gradient(135deg,#333,#777)",
                      boxShadow:"0 0 12px rgba(192,192,192,0.3)" }}>
                      {top3[1].avatar
                        ? <img src={top3[1].avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#C0C0C0",fontSize:22,fontWeight:900}}>{(top3[1].name||"?")[0]}</div>}
                    </div>
                    <p style={{fontSize:11,color:"#C0C0C0",fontWeight:800,margin:"0 0 3px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:85,marginLeft:"auto",marginRight:"auto"}}>{top3[1].name||"?"}</p>
                    <div style={{background:"rgba(192,192,192,0.12)",borderRadius:8,padding:"3px 8px",display:"inline-block",border:"1px solid rgba(192,192,192,0.25)"}}>
                      <span style={{color:"#C0C0C0",fontSize:11,fontWeight:900}}>🥈 {tab==="wins"?top3[1].wins:top3[1].best_streak}</span>
                    </div>
                  </div>
                )}

                {/* Hạng 1 */}
                <div onClick={() => goProfile(top3[0].user_id)}
                  style={{ flex:1, textAlign:"center", cursor:"pointer", transform:"translateY(-20px)" }}>
                  <div style={{fontSize:26,marginBottom:4,filter:"drop-shadow(0 0 8px rgba(255,215,0,0.8))"}}>👑</div>
                  <div style={{ width:76, height:76, borderRadius:38, margin:"0 auto 6px",
                    border:"3px solid #FFD700", overflow:"hidden",
                    background:"linear-gradient(135deg,#5a3a00,#c09000)",
                    boxShadow:"0 0 24px rgba(255,215,0,0.6), 0 0 48px rgba(255,215,0,0.2)" }}>
                    {top3[0].avatar
                      ? <img src={top3[0].avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFD700",fontSize:28,fontWeight:900}}>{(top3[0].name||"?")[0]}</div>}
                  </div>
                  <p style={{fontSize:13,color:"#FFD700",fontWeight:900,margin:"0 0 4px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:95,marginLeft:"auto",marginRight:"auto",textShadow:"0 0 8px rgba(255,215,0,0.6)"}}>{top3[0].name||"?"}</p>
                  <div style={{background:"rgba(255,215,0,0.15)",borderRadius:8,padding:"4px 12px",display:"inline-block",border:"1px solid rgba(255,215,0,0.4)",boxShadow:"0 0 10px rgba(255,215,0,0.2)"}}>
                    <span style={{color:"#FFD700",fontSize:13,fontWeight:900}}>🥇 {tab==="wins"?top3[0].wins:top3[0].best_streak}</span>
                  </div>
                </div>

                {/* Hạng 3 */}
                {top3[2] && (
                  <div onClick={() => goProfile(top3[2].user_id)}
                    style={{ flex:1, textAlign:"center", cursor:"pointer" }}>
                    <div style={{ width:58, height:58, borderRadius:29, margin:"0 auto 6px",
                      border:"2px solid #CD7F32", overflow:"hidden",
                      background:"linear-gradient(135deg,#3a2000,#7a5020)",
                      boxShadow:"0 0 12px rgba(205,127,50,0.3)" }}>
                      {top3[2].avatar
                        ? <img src={top3[2].avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#CD7F32",fontSize:22,fontWeight:900}}>{(top3[2].name||"?")[0]}</div>}
                    </div>
                    <p style={{fontSize:11,color:"#CD7F32",fontWeight:800,margin:"0 0 3px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:85,marginLeft:"auto",marginRight:"auto"}}>{top3[2].name||"?"}</p>
                    <div style={{background:"rgba(205,127,50,0.12)",borderRadius:8,padding:"3px 8px",display:"inline-block",border:"1px solid rgba(205,127,50,0.25)"}}>
                      <span style={{color:"#CD7F32",fontSize:11,fontWeight:900}}>🥉 {tab==="wins"?top3[2].wins:top3[2].best_streak}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px 12px"}}>
              <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.2))"}}/>
              <span style={{color:"rgba(255,215,0,0.5)",fontSize:10,fontWeight:800,letterSpacing:2}}>TOP 4-100</span>
              <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(255,215,0,0.2),transparent)"}}/>
            </div>

            {/* Rest */}
            {rest.map((e, i) => {
              const isMe = e.user_id === myPhone;
              const val  = tab === "wins" ? e.wins : e.best_streak;
              return (
                <div key={i} onClick={() => !isMe && goProfile(e.user_id)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px",
                    borderBottom:"1px solid rgba(255,255,255,0.04)",
                    background: isMe ? "rgba(212,83,28,0.08)" : "transparent",
                    cursor: isMe ? "default" : "pointer" }}>
                  <span style={{ color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:700,
                    width:28, textAlign:"center", flexShrink:0 }}>{i+4}</span>
                  <div style={{ width:36, height:36, borderRadius:18, flexShrink:0, overflow:"hidden",
                    background: isMe ? "linear-gradient(135deg,#D4531C,#ff6b35)" : "linear-gradient(135deg,#1a0a2e,#2d1254)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:900, color: isMe?"white":"rgba(255,255,255,0.4)" }}>
                    {e.avatar ? <img src={e.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (e.name||"?")[0]?.toUpperCase()}
                  </div>
                  <p style={{ flex:1, color: isMe?"#FFD700":"white", fontSize:13,
                    fontWeight: isMe?800:600, margin:0,
                    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                    {e.name||"Ẩn danh"}{isMe?" (bạn)":""}
                  </p>
                  <span style={{ color: isMe?"#D4531C":"rgba(255,215,0,0.6)", fontSize:13, fontWeight:900, flexShrink:0 }}>
                    {val} {tab==="wins"?"trận":"chuỗi"}
                  </span>
                </div>
              );
            })}
            <div style={{height:40}}/>
          </>
        )}
      </div>
    </div>
  );
}
