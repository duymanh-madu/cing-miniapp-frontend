import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

const MEDAL = ["🥇","🥈","🥉"];

export default function AlltimeLeaderboard({ onClose }) {
  const [games, setGames]   = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    apiClient.get("/game/leaderboard/alltime-games")
      .then(r => {
        const data = r.data?.data || [];
        setGames(data);
        if (data.length > 0) setActiveGame(data[0].game_key);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const currentGame = games.find(g => g.game_key === activeGame);
  const myEntry = currentGame?.data?.find(e => String(e.user_id) === String(profile?.id||profile?.phone));

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100}}/>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:101,
        background:"linear-gradient(180deg,#12071a,#0a0a0f)",
        borderRadius:"24px 24px 0 0",maxHeight:"88vh",
        display:"flex",flexDirection:"column",
        border:"1px solid rgba(255,215,0,0.15)"}}>

        {/* Handle */}
        <div style={{width:40,height:4,background:"rgba(255,255,255,0.15)",
          borderRadius:2,margin:"12px auto 4px"}}/>

        {/* Header */}
        <div style={{padding:"12px 20px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <p style={{color:"#FFD700",fontSize:10,fontWeight:800,margin:"0 0 2px",letterSpacing:3}}>
                KỶ LỤC MỌI THỜI ĐẠI
              </p>
              <p style={{color:"white",fontSize:17,fontWeight:900,margin:0}}>🏆 Alltime Hall of Fame</p>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",
              color:"white",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
          </div>

          {/* Game tabs */}
          {games.length > 1 && (
            <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:12}}>
              {games.map(g => (
                <button key={g.game_key} onClick={()=>setActiveGame(g.game_key)} style={{
                  whiteSpace:"nowrap",padding:"6px 14px",borderRadius:20,flexShrink:0,
                  border:activeGame===g.game_key?"none":"1px solid rgba(255,255,255,0.1)",
                  background:activeGame===g.game_key?"linear-gradient(135deg,#D4531C,#ff6b35)":"rgba(255,255,255,0.04)",
                  color:"white",fontSize:12,fontWeight:activeGame===g.game_key?900:500,cursor:"pointer"}}>
                  {g.icon} {g.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{overflowY:"auto",flex:1,WebkitOverflowScrolling:"touch"}}>
          {loading ? (
            <div style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>Đang tải...</div>
          ) : !currentGame || currentGame.data.length === 0 ? (
            <div style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>
              <div style={{fontSize:36,marginBottom:8}}>🎮</div>
              <p>Chưa có dữ liệu. Hãy chơi để xếp hạng!</p>
            </div>
          ) : (
            <>
              {/* Rewards banner */}
              {currentGame.rewards?.length > 0 && (
                <div style={{margin:"12px 16px 0",background:"linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.05))",
                  border:"1px solid rgba(255,215,0,0.2)",borderRadius:14,padding:"12px 16px"}}>
                  <p style={{color:"#FFD700",fontSize:10,fontWeight:800,margin:"0 0 8px",letterSpacing:2}}>
                    🎁 PHẦN THƯỞNG DANH HIỆU
                  </p>
                  <div style={{display:"flex",gap:8}}>
                    {currentGame.rewards.map((r,i) => (
                      <div key={i} style={{flex:1,background:"rgba(0,0,0,0.3)",borderRadius:10,
                        padding:"8px 6px",textAlign:"center",border:"1px solid rgba(255,215,0,0.1)"}}>
                        <p style={{fontSize:18,margin:"0 0 2px"}}>{MEDAL[i]}</p>
                        <p style={{color:"#FFD700",fontSize:13,fontWeight:900,margin:"0 0 1px"}}>{r.points}đ</p>
                        <p style={{color:"rgba(255,255,255,0.4)",fontSize:9,margin:0}}>{r.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My rank */}
              {myEntry && (
                <div style={{margin:"10px 16px 0",background:"rgba(212,83,28,0.1)",
                  border:"1px solid rgba(212,83,28,0.3)",borderRadius:12,padding:"10px 14px",
                  display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Hạng của bạn</span>
                  <div style={{textAlign:"right"}}>
                    <span style={{color:"#D4531C",fontSize:16,fontWeight:900}}>#{myEntry.rank}</span>
                    <span style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginLeft:8}}>
                      {(myEntry.score||0).toLocaleString()}đ
                    </span>
                  </div>
                </div>
              )}

              {/* Top 3 podium */}
              <div style={{padding:"16px 16px 8px"}}>
                {currentGame.data.slice(0,3).map((e,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,
                    padding:"12px 14px",borderRadius:12,marginBottom:6,
                    background:i===0?"rgba(255,215,0,0.08)":i===1?"rgba(192,192,192,0.05)":"rgba(205,127,50,0.05)",
                    border:`1px solid ${i===0?"rgba(255,215,0,0.25)":i===1?"rgba(192,192,192,0.15)":"rgba(205,127,50,0.15)"}`}}>
                    <span style={{fontSize:24,width:32,textAlign:"center"}}>{MEDAL[i]}</span>
                    <div style={{width:36,height:36,borderRadius:18,flexShrink:0,
                      background:"linear-gradient(135deg,#1a0a2e,#2d1254)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:16,fontWeight:900,color:"rgba(255,255,255,0.5)"}}>
                      {e.avatar
                        ? <img src={e.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : (e.player_name||"?")[0]?.toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{color:"white",fontSize:13,fontWeight:700,margin:0,
                        overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                        {e.player_name||"Ẩn danh"}
                        {String(e.user_id)===String(profile?.id||profile?.phone)&&" (bạn)"}
                      </p>
                      {e.kills > 0 && <p style={{color:"rgba(255,255,255,0.35)",fontSize:10,margin:0}}>
                        {e.kills} kills
                      </p>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{color:i===0?"#FFD700":i===1?"#C0C0C0":"#CD7F32",
                        fontSize:14,fontWeight:900,margin:0}}>
                        {(e.score||0).toLocaleString()}
                      </p>
                      <p style={{color:"rgba(255,255,255,0.25)",fontSize:9,margin:0}}>điểm</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{margin:"0 16px 10px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)"}}/>
                <span style={{color:"rgba(255,255,255,0.2)",fontSize:10,letterSpacing:2}}>TOP 4–100</span>
                <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)"}}/>
              </div>

              {/* Rest */}
              <div style={{padding:"0 16px 20px"}}>
                {currentGame.data.slice(3).map((e,i) => {
                  const isMe = String(e.user_id)===String(profile?.id||profile?.phone);
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,
                      padding:"9px 12px",borderRadius:10,marginBottom:3,
                      background:isMe?"rgba(212,83,28,0.08)":"rgba(255,255,255,0.02)",
                      border:isMe?"1px solid rgba(212,83,28,0.2)":"1px solid rgba(255,255,255,0.03)"}}>
                      <span style={{color:"rgba(255,255,255,0.2)",fontSize:11,fontWeight:700,
                        width:24,textAlign:"center"}}>{e.rank}</span>
                      <div style={{width:30,height:30,borderRadius:15,flexShrink:0,
                        background:isMe?"linear-gradient(135deg,#D4531C,#ff6b35)":"linear-gradient(135deg,#1a0a2e,#2d1254)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:12,fontWeight:900,color:isMe?"white":"rgba(255,255,255,0.3)"}}>
                        {e.avatar
                          ? <img src={e.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}}/>
                          : (e.player_name||"?")[0]?.toUpperCase()}
                      </div>
                      <p style={{flex:1,color:isMe?"#FFD700":"white",fontSize:12,
                        fontWeight:isMe?800:500,margin:0,
                        overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                        {e.player_name||"Ẩn danh"}{isMe&&" (bạn)"}
                      </p>
                      <p style={{color:isMe?"#D4531C":"rgba(255,215,0,0.5)",
                        fontSize:12,fontWeight:800,margin:0}}>
                        {(e.score||0).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
