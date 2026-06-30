import { useState, useEffect, useRef } from "react";
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
  "cing-stack-tower": "Xếp Tháp Cing 🧱",
  "chess": "Kỳ thủ cờ vua ♟️",
};

export default function GameLeaderboard({ gameKey, onClose }) {
  const [data,        setData]        = useState([]);
  const [myRank,      setMyRank]      = useState(null);
  const [rewards,     setRewards]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [animatedIds, setAnimatedIds] = useState(() => new Set());

  const prevRanksRef   = useRef(new Map());
  const animationTimer = useRef(null);

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

  const rememberRanks = (rows = []) => {
    prevRanksRef.current = new Map(
      rows.map((row, index) => [String(row.user_id), index + 1])
    );
  };

  const applyRealtimeRows = (rows = [], updatedUserId = "") => {
    const prevRanks = prevRanksRef.current || new Map();
    const hotIds = new Set();

    rows.forEach((row, index) => {
      const id = String(row.user_id);
      const nextRank = index + 1;
      const prevRank = prevRanks.get(id);

      if (prevRank && prevRank !== nextRank) hotIds.add(id);
      if (updatedUserId && id === String(updatedUserId)) hotIds.add(id);
    });

    setData(rows);
    updateMyRankFromRows(rows);
    rememberRanks(rows);

    if (hotIds.size > 0) {
      setAnimatedIds(hotIds);
      if (animationTimer.current) clearTimeout(animationTimer.current);
      animationTimer.current = setTimeout(() => {
        setAnimatedIds(new Set());
      }, 1800);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await apiClient.get(`/leaderboard/top-games/${gameKey}`);
      const rows = r.data?.data || [];
      setData(rows);
      rememberRanks(rows);
      updateMyRankFromRows(rows);

      if (r.data?.rewards?.length) setRewards(r.data.rewards);

      const phone = getPhone();
      const rankId = phone || profileId;
      if (rankId) {
        apiClient.get(`/leaderboard/user-game-rank/${rankId}/${gameKey}`)
          .then(r2 => setMyRank(r2.data?.data)).catch(() => {});
      }
    } catch(e) { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();

    const handleRealtimeLeaderboard = (payload) => {
      if (payload?.type && payload.type !== "game") return;
      if (payload?.game_key && payload.game_key !== gameKey) return;
      if (payload?.scope && payload.scope !== "weekly") return;
      if (!Array.isArray(payload?.leaderboard)) return;

      applyRealtimeRows(
        payload.leaderboard,
        payload?.updated_user?.user_id
      );
    };

    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.off("leaderboard.updated", handleRealtimeLeaderboard);
        socket.on("leaderboard.updated", handleRealtimeLeaderboard);
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };

    attach();

    return () => {
      if (animationTimer.current) clearTimeout(animationTimer.current);
      getRuntimeSocket()?.off("leaderboard.updated", handleRealtimeLeaderboard);
    };
  }, [gameKey, profileId]);

  const phone = getPhone();
  const top3  = data.slice(0, 3);
  const rest  = data.slice(3);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200,
      background:"linear-gradient(180deg,#0a0a0f 0%,#12071a 50%,#0a0a0f 100%)",
      display:"flex", flexDirection:"column" }}>
      <style>{`
        @keyframes cingRankPop {
          0% { opacity: .68; transform: translateY(10px) scale(.985); filter: brightness(1); }
          35% { opacity: 1; transform: translateY(-3px) scale(1.018); filter: brightness(1.28); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
        }
        @keyframes cingGoldSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          25% { opacity: .9; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes cingChampionGlow {
          0%, 100% { filter: drop-shadow(0 0 7px rgba(255,215,0,.28)); }
          50% { filter: drop-shadow(0 0 18px rgba(255,215,0,.58)); }
        }
        @keyframes cingCrownPop {
          0% { transform: translateY(-16px) scale(.96); }
          35% { transform: translateY(-22px) scale(1.06); }
          100% { transform: translateY(-16px) scale(1); }
        }
        @keyframes cingBadgePulse {
          0%, 100% { opacity: .78; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>

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
            <span style={{ color:"#FFD700", fontSize:14, fontWeight:900 }}>Top {myRank.rank} · {myRank.score} điểm</span>
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
                  style={{ flex:1, textAlign:"center", cursor:"pointer",
                    transform:"translateY(-16px)",
                    animation: animatedIds.has(String(top3[0]?.user_id || "")) ? "cingCrownPop 1200ms cubic-bezier(.2,.9,.2,1)" : "cingChampionGlow 2.6s ease-in-out infinite" }}>
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
              const rank = i + 4;
              const entryId = String(entry.user_id || `${gameKey}_${rank}`);
              const isMe = phone && String(entry.user_id) === phone;
              const isHot = animatedIds.has(entryId);

              return (
                <div key={entryId} onClick={() => goProfile(entry.user_id)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px",
                    borderBottom:"1px solid rgba(255,255,255,0.04)",
                    background: isHot
                      ? "linear-gradient(90deg, rgba(255,215,0,0.18), rgba(255,107,0,0.08), rgba(255,255,255,0.02))"
                      : isMe ? "rgba(255,215,0,0.06)" : "transparent",
                    cursor:"pointer",
                    position:"relative",
                    overflow:"hidden",
                    animation: isHot ? "cingRankPop 1050ms cubic-bezier(.2,.9,.2,1)" : "none",
                    transition:"background 220ms ease, box-shadow 220ms ease, transform 220ms ease",
                    boxShadow: isHot ? "inset 0 0 0 1px rgba(255,215,0,0.18), 0 0 18px rgba(255,215,0,0.18)" : "none" }}>
                  {isHot && (
                    <span style={{ position:"absolute", inset:0,
                      background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)",
                      animation:"cingGoldSweep 900ms ease-out",
                      pointerEvents:"none" }}/>
                  )}

                  <span style={{ color: isHot ? "#FFD700" : "rgba(255,255,255,0.3)",
                    fontSize:13, fontWeight:900, width:28, textAlign:"center", flexShrink:0,
                    textShadow: isHot ? "0 0 10px rgba(255,215,0,0.55)" : "none" }}>Top {rank}</span>

                  <div style={{ width:36, height:36, borderRadius:18, flexShrink:0, overflow:"hidden",
                    background:"linear-gradient(135deg,#1a0a2e,#2d1254)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:900, color:"rgba(255,255,255,0.4)",
                    border: isHot ? "1px solid rgba(255,215,0,0.55)" : "1px solid rgba(255,255,255,0.04)",
                    boxShadow: isHot ? "0 0 14px rgba(255,215,0,0.35)" : "none" }}>
                    {entry.avatar ? <img src={entry.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (entry.player_name||"?")[0]?.toUpperCase()}
                  </div>

                  <p style={{ flex:1, color: isHot ? "#FFE58A" : isMe?"#FFD700":"white", fontSize:13,
                    fontWeight: isHot || isMe ? 900 : 600, margin:0,
                    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                    {entry.player_name||"Ẩn danh"}{isMe?" (bạn)":""}
                  </p>

                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2, flexShrink:0 }}>
                    <span style={{ color:"#FFD700", fontSize:13, fontWeight:900,
                      textShadow: isHot ? "0 0 10px rgba(255,215,0,0.6)" : "none" }}>
                      {(entry.score||0).toLocaleString()}
                    </span>
                    {isHot && (
                      <span style={{ color:"#12071a", background:"#FFD700", borderRadius:999,
                        padding:"1px 6px", fontSize:8, fontWeight:1000,
                        letterSpacing:.4, animation:"cingBadgePulse 900ms ease-in-out infinite" }}>
                        NEW BEST
                      </span>
                    )}
                  </div>
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
