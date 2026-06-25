import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

const MEDAL = ["🥇","🥈","🥉"];

function getPhone() {
  const sources = [
    useRuntimeCustomerIdentityStore.getState().identity?.phone,
    useAuthStore.getState().profile?.phone,
  ];
  for (const src of sources) {
    if (!src || src === "pending") continue;
    const n = src.replace(/\D/g, "").replace(/^84/, "0");
    if (n.length >= 9) return n;
  }
  return "";
}

const GAME_NAMES = {
  "black-pearl-rush": "Bay cùng trân châu 🫧",
  "chess": "Kỳ thủ cờ vua ♟️",
};

export default function GameLeaderboard({ gameKey, onClose }) {
  const [data,    setData]    = useState([]);
  const [myRank,  setMyRank]  = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const profileId   = useAuthStore(s => s.profile?.id);
  const navigate    = useNavigate();
  const goProfile   = (uid) => { if (uid) { onClose(); setTimeout(() => navigate(`/profile/${uid}`), 150); } };

  const updateMyRankFromRows = (rows = []) => {
    const phone = getPhone();
    const rankId = phone || profileId;
    if (!rankId) return;

    const idx = rows.findIndex(r => String(r.user_id) === String(rankId));
    if (idx >= 0) {
      setMyRank({
        rank: idx + 1,
        total: rows.length,
        score: rows[idx]?.score ?? rows[idx]?.value ?? 0,
      });
    }
  };

  const fetchData = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const r = await apiClient.get(`/leaderboard/top-games/${gameKey}`);
      const rows = r.data?.data || [];
      setData(rows);
      updateMyRankFromRows(rows);

      if (r.data?.rewards?.length) setRewards(r.data.rewards);

      const phone = getPhone();
      const rankId = phone || profileId;
      if (rankId && !silent) {
        apiClient.get(`/leaderboard/user-game-rank/${rankId}/${gameKey}`)
          .then(r2 => setMyRank(r2.data?.data)).catch(() => {});
      }
    } catch(e) {
      if (!silent) setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const applyRealtimeLeaderboard = (payload) => {
    if (payload?.type && payload.type !== "game") return;
    if (payload?.game_key && payload.game_key !== gameKey) return;
    if (payload?.scope && payload.scope !== "weekly") return;

    if (Array.isArray(payload?.leaderboard)) {
      setData(payload.leaderboard);
      updateMyRankFromRows(payload.leaderboard);
      return;
    }

    fetchData({ silent: true });
  };

  useEffect(() => {
    fetchData();

    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.off("leaderboard.updated", applyRealtimeLeaderboard);
        socket.on("leaderboard.updated", applyRealtimeLeaderboard);
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };

    attach();

    return () => {
      getRuntimeSocket()?.off("leaderboard.updated", applyRealtimeLeaderboard);
    };
  }, [gameKey, profileId]);

  const phone = getPhone();
  const top3  = data.slice(0, 3);
  const rest  = data.slice(3);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200,
      background:"linear-gradient(180deg,#0a0a0f 0%,#12071a 50%,#0a0a0f 100%)",
      display:"flex", flexDirection:"column" }}>

      {/* Safe area + Header */}
      <div style={{ background:"linear-gradient(180deg,#0a0a0f,#12071a)",
        paddingTop:"max(env(safe-area-inset-top,0px) + 8px, 48px)",
        paddingBottom:12, paddingLeft:16, paddingRight:16,
        borderBottom:"1px solid rgba(255,215,0,0.1)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.1)", color:"white",
            borderRadius:12, width:38, height:38, cursor:"pointer", fontSize:18,
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1, textAlign:"center" }}>
            <p style={{ color:"rgba(255,215,0,0.6)", fontSize:10, fontWeight:800,
              letterSpacing:3, margin:"0 0 2px", textTransform:"uppercase" }}>BXH TUẦN</p>
            <h1 style={{ color:"white", fontSize:18, fontWeight:900, margin:0 }}>
              {GAME_NAMES[gameKey] || gameKey}
            </h1>
          </div>
          <div style={{ width:38 }}/>
        </div>

        {/* Rewards */}
        {rewards.length > 0 && (
          <div style={{ marginTop:10, display:"flex", gap:6 }}>
            {rewards.slice(0,3).map((r,i) => (
              <div key={i} style={{ flex:1, background:"rgba(255,215,0,0.06)",
                borderRadius:10, padding:"6px 4px", textAlign:"center",
                border:"1px solid rgba(255,215,0,0.12)" }}>
                <p style={{ fontSize:16, margin:"0 0 1px" }}>{MEDAL[i]}</p>
                <p style={{ color:"#FFD700", fontSize:12, fontWeight:900, margin:"0 0 1px" }}>{r.points} điểm</p>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:9, margin:0 }}>{r.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* My rank */}
        {myRank?.rank && (
          <div style={{ marginTop:8, padding:"8px 12px",
            background:"rgba(255,215,0,0.08)", borderRadius:10,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            border:"1px solid rgba(255,215,0,0.15)" }}>
            <span style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>Hạng của bạn</span>
            <span style={{ color:"#FFD700", fontSize:14, fontWeight:900 }}>#{myRank.rank} · {myRank.score} điểm</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
        {loading ? (
          <div style={{ padding:"60px", textAlign:"center", color:"rgba(255,255,255,0.3)" }}>Đang tải...</div>
        ) : data.length === 0 ? (
          <div style={{ padding:"60px 24px", textAlign:"center", color:"rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎮</div>
            <p style={{ fontSize:14 }}>Chưa có dữ liệu. Hãy chơi để xếp hạng!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 1 && (
              <div style={{ padding:"24px 16px 16px", display:"flex", alignItems:"flex-end",
                justifyContent:"center", gap:12 }}>
                {/* Hạng 2 */}
                <div onClick={() => { const e=top3[1]; if(e&&String(e.user_id)!==phone) goProfile(e.user_id); }}
                  style={{ flex:1, textAlign:"center", cursor:"pointer" }}>
                  <div style={{ width:56, height:56, borderRadius:28, margin:"0 auto 6px",
                    border:"2px solid #C0C0C0", overflow:"hidden",
                    background:"linear-gradient(135deg,#555,#888)" }}>
                    {top3[1]?.avatar
                      ? <img src={top3[1].avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:20,fontWeight:900}}>{(top3[1]?.player_name||"?")[0]}</div>}
                  </div>
                  <p style={{fontSize:11,color:"#C0C0C0",fontWeight:800,margin:"0 0 2px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:80,marginLeft:"auto",marginRight:"auto"}}>{top3[1]?.player_name||"?"}</p>
                  <div style={{background:"rgba(192,192,192,0.15)",borderRadius:8,padding:"3px 8px",display:"inline-block"}}>
                    <span style={{color:"#C0C0C0",fontSize:12,fontWeight:900}}>🥈 {(top3[1]?.score||0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Hạng 1 */}
                <div onClick={() => { const e=top3[0]; if(e&&String(e.user_id)!==phone) goProfile(e.user_id); }}
                  style={{ flex:1, textAlign:"center", cursor:"pointer", transform:"translateY(-16px)" }}>
                  <div style={{fontSize:24,marginBottom:4}}>👑</div>
                  <div style={{ width:72, height:72, borderRadius:36, margin:"0 auto 6px",
                    border:"3px solid #FFD700", overflow:"hidden",
                    background:"linear-gradient(135deg,#5a3a00,#c09000)",
                    boxShadow:"0 0 20px rgba(255,215,0,0.5)" }}>
                    {top3[0]?.avatar
                      ? <img src={top3[0].avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFD700",fontSize:24,fontWeight:900}}>{(top3[0]?.player_name||"?")[0]}</div>}
                  </div>
                  <p style={{fontSize:13,color:"#FFD700",fontWeight:900,margin:"0 0 2px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:90,marginLeft:"auto",marginRight:"auto"}}>{top3[0]?.player_name||"?"}</p>
                  <div style={{background:"rgba(255,215,0,0.15)",borderRadius:8,padding:"4px 10px",display:"inline-block",border:"1px solid rgba(255,215,0,0.3)"}}>
                    <span style={{color:"#FFD700",fontSize:13,fontWeight:900}}>🥇 {(top3[0]?.score||0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Hạng 3 */}
                <div onClick={() => { const e=top3[2]; if(e&&String(e.user_id)!==phone) goProfile(e.user_id); }}
                  style={{ flex:1, textAlign:"center", cursor:"pointer" }}>
                  <div style={{ width:56, height:56, borderRadius:28, margin:"0 auto 6px",
                    border:"2px solid #CD7F32", overflow:"hidden",
                    background:"linear-gradient(135deg,#4a2a00,#8a5a20)" }}>
                    {top3[2]?.avatar
                      ? <img src={top3[2].avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#CD7F32",fontSize:20,fontWeight:900}}>{(top3[2]?.player_name||"?")[0]}</div>}
                  </div>
                  <p style={{fontSize:11,color:"#CD7F32",fontWeight:800,margin:"0 0 2px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:80,marginLeft:"auto",marginRight:"auto"}}>{top3[2]?.player_name||"?"}</p>
                  <div style={{background:"rgba(205,127,50,0.15)",borderRadius:8,padding:"3px 8px",display:"inline-block"}}>
                    <span style={{color:"#CD7F32",fontSize:12,fontWeight:900}}>🥉 {(top3[2]?.score||0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px 12px"}}>
              <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.2))"}}/>
              <span style={{color:"rgba(255,215,0,0.5)",fontSize:10,fontWeight:800,letterSpacing:2}}>TOP 4-100</span>
              <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(255,215,0,0.2),transparent)"}}/>
            </div>

            {/* Rest list */}
            {rest.map((entry, i) => {
              const isMe = phone && String(entry.user_id) === phone;
              return (
                <div key={i} onClick={() => goProfile(entry.user_id)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px",
                    borderBottom:"1px solid rgba(255,255,255,0.04)",
                    background: isMe ? "rgba(255,215,0,0.06)" : "transparent",
                    cursor:"pointer" }}>
                  <span style={{ color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:700, width:28, textAlign:"center", flexShrink:0 }}>{i+4}</span>
                  <div style={{ width:36, height:36, borderRadius:18, flexShrink:0, overflow:"hidden",
                    background:"linear-gradient(135deg,#1a0a2e,#2d1254)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:900, color:"rgba(255,255,255,0.4)" }}>
                    {entry.avatar ? <img src={entry.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (entry.player_name||"?")[0]?.toUpperCase()}
                  </div>
                  <p style={{ flex:1, color: isMe?"#FFD700":"white", fontSize:13,
                    fontWeight: isMe?800:600, margin:0,
                    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                    {entry.player_name||"Ẩn danh"}{isMe?" (bạn)":""}
                  </p>
                  <span style={{ color:"#FFD700", fontSize:13, fontWeight:900, flexShrink:0 }}>
                    {(entry.score||0).toLocaleString()}
                  </span>
                </div>
              );
            })}
            <div style={{height:32}}/>
          </>
        )}
      </div>
    </div>
  );
}
