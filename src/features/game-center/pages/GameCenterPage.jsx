
const GAME_LABELS = {
  "black-pearl-rush": "Bay cùng trân châu",
  "cing-stack-tower": "Xếp Tháp Cing",
  chess: "Kỳ thủ cờ vua",
};

function dailyChallengeLabel(c) {
  if (c?.label) return c.label;
  const gameName = GAME_LABELS[c?.game_key] || "trò chơi";
  const target = c?.target_value || 100;
  if (c?.challenge_type === "wins") return `Thắng ${target} ván game "${gameName}"`;
  if (c?.challenge_type === "score") return `Đạt ${target} điểm trong game "${gameName}"`;
  return `Đạt combo ${target} trong game "${gameName}"`;
}

import { resolveProfileName } from "@/utils/profile/profileDisplay";
import React, { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import CommunityChat from "../components/CommunityChat";
import { getAllGames } from "@/games/registry/gameRegistry";
import BlackPearlRush from "@/games/black-pearl-rush/BlackPearlRush";
import { setGamePlaying } from "@/runtime/game/gamePlayState";
import { trackGameStart, trackGameStop } from "@/runtime/tracking/gameTracking";
import { useMemberRequired } from "@/hooks/useMemberRequired";
import GameLeaderboard from "../components/GameLeaderboard";
import AlltimeLeaderboard from "../components/AlltimeLeaderboard";
import ChessGame from "../games/chess/ChessGame";
import ChessLeaderboard from "../games/chess/ChessLeaderboard";
import GamePlaysCard from "../components/GamePlaysCard";

// Lấy phone hợp lệ từ các store — bỏ qua "pending" và UUID
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

function DraggableChatButton({ onClick }) {
  const [pos, setPos] = React.useState({ x: window.innerWidth - 68, y: window.innerHeight - 140 });
  const dragging  = React.useRef(false);
  const startPos  = React.useRef(null);
  const moved     = React.useRef(false);
  const touchUsed = React.useRef(false);

  const onTouchStart = (e) => {
    touchUsed.current = true;
    const t = e.touches[0];
    dragging.current = true;
    moved.current    = false;
    startPos.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
  };
  const onTouchMove = (e) => {
    if (!dragging.current) return;
    const t = e.touches[0];
    const nx = Math.max(0, Math.min(window.innerWidth - 52, t.clientX - startPos.current.x));
    const ny = Math.max(0, Math.min(window.innerHeight - 52, t.clientY - startPos.current.y));
    if (Math.abs(nx - pos.x) > 5 || Math.abs(ny - pos.y) > 5) moved.current = true;
    setPos({ x: nx, y: ny });
    e.preventDefault();
  };
  const onTouchEnd = (e) => {
    dragging.current = false;
    if (!moved.current) {
      e.preventDefault();
      onClick();
    }
  };
  const handleClick = () => {
    if (touchUsed.current) { touchUsed.current = false; return; }
    onClick();
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
      style={{ position:"fixed", left:pos.x, top:pos.y, zIndex:9999,
        width:52, height:52, borderRadius:26,
        background:"linear-gradient(135deg,#D4531C,#FF6B35)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, boxShadow:"0 4px 16px rgba(212,83,28,0.5)",
        userSelect:"none", touchAction:"none", cursor:"pointer" }}>
      💬
    </div>
  );
}
function showToast(msg) {
  import("zmp-sdk").then(sdk => {
    sdk.showToast?.({ text: msg, duration: "long" });
  }).catch(() => {});
}

export default function GameCenterPage() {
  const games = getAllGames();
  const [activeGame, setActiveGame]       = useState(null);
  const [playingChess, setPlayingChess]   = useState(false);

  useEffect(() => {
    setGamePlaying(playingChess || !!activeGame);
    return () => setGamePlaying(false);
  }, [playingChess, activeGame]);
  const [showBoard, setShowBoard]         = useState(null);
  const [showChessLB, setShowChessLB]     = useState(false);
  const [showAlltimeLB, setShowAlltimeLB] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [challenges, setChallenges]       = useState([]);
  const [challenge, setChallenge]         = useState(null);
  const [missions,  setMissions]          = useState([]);
  const [gamePlays, setGamePlays]         = useState(null);
  const [showChat, setShowChat]           = useState(false);

  const authenticated = useAuthStore(s => s.authenticated);
  const { isActivated, requireMember, MemberPrompt } = useMemberRequired();
  const profile       = useAuthStore(s => s.profile);

  useEffect(() => {
    apiClient.get("/game/daily-challenge")
      .then(r => {
        const data = r.data?.data;
        if (Array.isArray(data)) {
          setChallenges(data);
          setChallenge(data[0] || null);
        } else {
          setChallenges(data ? [data] : []);
          setChallenge(data || null);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch missions riêng — chờ phone load xong
  const runtimePhone2 = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  useEffect(() => {
    const phone = getPhone();
    if (!phone || phone === "pending") return;
    apiClient.get(`/missions/${phone}`)
      .then(r => setMissions(r.data?.data || []))
      .catch(() => {});
  }, [runtimePhone2]);

  // Retry missions sau 3s nếu vẫn rỗng
  useEffect(() => {
    const timer = setTimeout(() => {
      if (missions.length > 0) return;
      const phone = getPhone();
      if (!phone || phone === "pending") return;
      apiClient.get(`/missions/${phone}`)
        .then(r => setMissions(r.data?.data || []))
        .catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [runtimePhone2]);

  // Socket: challenge winner
  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.on("challenge.won", (data) => {
          // Update tất cả challenges khi có người nhận thưởng
          const wonPayload = data?.payload || data;
          setChallenges(prev => prev.map(c =>
            c.game_key === wonPayload?.game_key
              ? { ...c, completed: true, winner_name: wonPayload?.winner_name, winner_user_id: wonPayload?.winner_user_id }
              : c
          ));
          setChallenge(prev => prev?.game_key === wonPayload?.game_key
            ? { ...prev, completed: true, winner_name: wonPayload?.winner_name, winner_user_id: wonPayload?.winner_user_id }
            : prev
          );
          // Popup toàn server
          window.dispatchEvent(new CustomEvent("challenge_won", { detail: data?.payload }));
        });
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };
    attach();

  return () => { getRuntimeSocket()?.off("challenge.won"); };
  }, []);

  const handleGameOver = async ({ bestCombo, score }) => {
    const phone      = getPhone();
    const userId     = phone || useAuthStore.getState().profile?.id || "";
    const playerName = resolveProfileName(useAuthStore.getState().profile || profile, "Cing iu");
    const gameKey    = activeGame || "black-pearl-rush";
    const finalScore = score || bestCombo || 0;

    if (!userId || !finalScore) return;

    // Save score
    try {
      await apiClient.post("/game/score", {
        game_key:    gameKey,
        user_id:     userId,
        score:       finalScore,
        player_name: playerName,
        avatar:      useAuthStore.getState().profile?.avatar || "",
        combo:       bestCombo || 0,
      });
    } catch(e) { console.warn("[GAME] score failed:", e.message); }

    // Claim daily challenge
    if (bestCombo > 0) {
      try {
        const res = await apiClient.post("/game/daily-challenge/claim", {
          user_id:     userId,
          player_name: playerName,
          avatar:      useAuthStore.getState().profile?.avatar || "",
          combo:       bestCombo,
          game_key:    gameKey,
        });
        if (res.data?.success) {
          showToast("🏆 " + res.data.message);
        }
      } catch(e) {}
    }
  };

  const handlePlayGame = (gameId) => {
    if (!requireMember()) return;
    if (gamePlays !== null && gamePlays <= 0) {
      showToast("Hết lượt chơi! Hãy đặt hàng để nhận thêm lượt."); return;
    }
    setTimeout(() => {
      setActiveGame(gameId);
      trackGameStart(gameId);
    }, 50);
  };

  const handleRestart = () => {
    // Chỉ check lượt, không trừ — lượt trừ khi tap START
    if (gamePlays !== null && gamePlays <= 0) {
      showToast("Hết lượt chơi! Hãy đặt hàng để nhận thêm lượt.");
      setActiveGame(null);
      return false;
    }
    return true;
  };

  const handlePlayChess = () => {
    if (!requireMember()) return;
    if (gamePlays !== null && gamePlays <= 0) { showToast("Hết lượt chơi!"); return; }
    setPlayingChess(true);
    trackGameStart('chess');
    // KHÔNG trừ lượt ở đây — chỉ trừ khi match thành công (chess:matched)
  };

  // Callback cho ChessGame.findMatch — check lượt trước khi tìm ván mới
  const handleFindChessMatch = () => {
    if (gamePlays !== null && gamePlays <= 0) {
      showToast("Hết lượt chơi! Hãy đặt hàng để nhận thêm lượt.");
      return false; // Chặn tìm ván mới
    }
    return true; // Cho phép tìm ván
  };

  if (showChat) return <CommunityChat onClose={() => setShowChat(false)} />;
  if (playingChess) return <ChessGame onExit={() => { trackGameStop('chess'); setPlayingChess(false); }} onFindMatch={handleFindChessMatch} />;

  if (activeGame) {
    const game     = games.find(g => g.id === activeGame);
    const GameComp = game?.component || BlackPearlRush;
    return (
      <>
        <GameComp
          onExit={() => { trackGameStop(activeGame); setActiveGame(null); }}
          onGameOver={handleGameOver}
          onRestart={handleRestart}
          onShowLeaderboard={() => setShowBoard(activeGame)}
          onGameStart={() => {
            const ph = getPhone();
            if (ph) {
              apiClient.post("/game/use-play", {
                user_id: ph,
                game_name: game?.displayName || activeGame || "game",
              }).catch(e => console.warn("[GAME] use-play:", e.message));
              setGamePlays(prev => prev !== null ? Math.max(0, prev - 1) : null);
            }
          }}
        />
        {showBoard && <GameLeaderboard gameKey={showBoard} onClose={() => setShowBoard(null)} />}
      </>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#0a0a0f 0%,#12071a 50%,#0d0d1a 100%)", paddingBottom:100 }}>
      {/* HEADER */}
      <div style={{ padding:"16px 20px 16px", paddingTop:"max(env(safe-area-inset-top,0px) + 12px, 52px)", textAlign:"center" }}>
        <p style={{ color:"rgba(255,215,0,0.6)", fontSize:11, letterSpacing:4, fontWeight:700, margin:"0 0 6px", textTransform:"uppercase" }}>Cing Hu Tang Kinh Bắc</p>
        <h1 style={{ color:"white", fontSize:28, fontWeight:900, margin:0, letterSpacing:2, textShadow:"0 0 40px rgba(255,215,0,0.3)" }}>GAME CENTER</h1>
        <button onClick={() => requireMember(() => setShowAlltimeLB(true))} style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)", color:"#FFD700", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:800, cursor:"pointer", marginTop:8 }}>🏆 Kỷ lục alltime</button>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, margin:"6px 0 0" }}>Nơi các Cing iu thoả sức so tài</p>
      </div>


      {/* DAILY CHALLENGE */}
      {MemberPrompt}
      <div style={{ margin:"0 16px 20px" }}>
        <p style={{ color:"#FFD700", fontSize:11, fontWeight:800, margin:"0 0 10px", letterSpacing:2 }}>🎯 THÁCH THỨC HÔM NAY</p>
        {challenges.map((c, idx) => (
          <div key={idx} style={{
            background: c.completed ? "linear-gradient(135deg,rgba(76,175,80,0.15),rgba(76,175,80,0.05))" : "linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,140,0,0.08))",
            border: c.completed ? "1px solid rgba(76,175,80,0.3)" : "1px solid rgba(255,215,0,0.2)",
            borderRadius:16, padding:"14px 16px", marginBottom:10,
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: c.completed ? 8 : 0 }}>
              <div style={{ flex:1 }}>
                {c.completed && <p style={{ color:"#4CAF50", fontSize:10, fontWeight:800, margin:"0 0 3px", letterSpacing:2 }}>✅ ĐÃ CÓ NGƯỜI NHẬN THƯỞNG</p>}
                {!c.completed && <p style={{ color:"#FFD700", fontSize:10, fontWeight:800, margin:"0 0 3px", letterSpacing:2 }}>🎯 THÁCH THỨC</p>}
                <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 3px" }}>
                  {dailyChallengeLabel(c)}
                </p>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, margin:0 }}>
                  Thưởng: +{c.reward_points || 50} điểm • Chỉ 1 người đầu tiên
                </p>
              </div>
              <div style={{ fontSize:30, marginLeft:10 }}>{c.completed ? "🏆" : "🎯"}</div>
            </div>
            {c.completed && c.winner_name && (
              <div style={{ background:"rgba(76,175,80,0.1)", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>👑</span>
                <p style={{ color:"#4CAF50", fontSize:12, fontWeight:700, margin:0 }}>
                  Chúc mừng <strong>{c.winner_name}</strong> đã nhận thưởng!
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── NHIỆM VỤ NGÀY ── */}
      {missions.length > 0 && (
        <div style={{ margin:"0 16px 16px" }}>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:3, margin:"0 0 10px", textTransform:"uppercase" }}>📋 Nhiệm Vụ Hôm Nay</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {missions.map((m, i) => (
              <div key={i} style={{ background: m.completed ? "rgba(76,175,80,0.1)" : "rgba(255,255,255,0.05)",
                border:`1px solid ${m.completed ? "rgba(76,175,80,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{m.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ color: m.completed ? "#4CAF50" : "white", fontSize:13, fontWeight:700, margin:"0 0 2px" }}>
                    {m.label}
                  </p>
                  <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, margin:0 }}>
                    Phần thưởng: +{m.plays} lượt chơi{m.points > 0 ? ` · +${m.points} điểm` : ""}
                  </p>
                </div>
                {m.completed ? (
                  <span style={{ color:"#4CAF50", fontSize:22 }}>✅</span>
                ) : m.condition_type === "checkin" ? (
                  <button onClick={async () => {
                    const phone = getPhone();
                    if (!phone) return;
                    try {
                      const res = await apiClient.post("/missions/checkin", { user_id: phone });
                      if (res.data?.success) {
                        setMissions(prev => prev.map(x => x.type === "checkin" ? {...x, completed:true} : x));
                        showToast(`✅ Điểm danh thành công! +${m.plays} lượt chơi`);
                      } else showToast(res.data?.message || "Đã điểm danh hôm nay rồi!");
                    } catch(e) { showToast("Lỗi điểm danh"); }
                  }}
                    style={{ background:"linear-gradient(135deg,#D4531C,#FF6B35)", border:"none",
                      borderRadius:10, padding:"8px 14px", color:"white", fontSize:12,
                      fontWeight:800, cursor:"pointer", flexShrink:0 }}>
                    Điểm danh
                  </button>
                ) : (
                  <span style={{ color:"rgba(255,255,255,0.25)", fontSize:11 }}>Tự động</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <GamePlaysCard onPlaysUpdate={setGamePlays} />

      {/* GAME LIST */}
      <div style={{ padding:"0 16px" }}>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:3, margin:"0 0 12px", textTransform:"uppercase" }}>Trò Chơi</p>
        {games.map(game => (
          <div key={game.id} style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"20px", marginBottom:12, display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:18, flexShrink:0, background:"linear-gradient(135deg,#1a0a2e,#2d1254)", border:"1px solid rgba(255,215,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🎮</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <p style={{ color:"white", fontSize:15, fontWeight:800, margin:0 }}>{game.displayName || game.name}</p>
                {game.status==="LIVE" && <span style={{ background:"rgba(0,255,100,0.15)", color:"#00ff64", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:8, letterSpacing:1 }}>LIVE</span>}
              </div>
              <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, margin:"0 0 12px" }}>
                {game.description || "Thử thách phản xạ — ghi điểm cao nhất"}
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => handlePlayGame(game.id)} style={{ background:"linear-gradient(135deg,#D4531C,#ff6b35)", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:12, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 15px rgba(212,83,28,0.4)" }}>Chơi ngay</button>
                <button onClick={() => requireMember(() => setShowBoard(game.id))} style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)", color:"#FFD700", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>🏆 BXH</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHESS */}
      <div style={{ margin:"0 16px 16px", background:"linear-gradient(135deg,#0a0a1a,#1a1508)", borderRadius:20, padding:"20px", border:"1px solid rgba(255,215,0,0.25)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,215,0,0.08)", filter:"blur(30px)" }}/>
        <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ width:52, height:52, borderRadius:14, flexShrink:0, background:"rgba(255,215,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, border:"1px solid rgba(255,215,0,0.3)" }}>♟️</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <p style={{ color:"white", fontSize:15, fontWeight:800, margin:0 }}>Kỳ thủ cờ vua</p>
              <span style={{ background:"rgba(255,80,0,0.2)", color:"#FF6030", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:8 }}>MULTIPLAYER</span>
              <span style={{ background:"rgba(0,255,100,0.15)", color:"#00ff64", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:8 }}>NEW</span>
            </div>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, margin:"0 0 12px" }}>PvP 1v1 · Chiếu hết đối thủ · Leo bảng danh vọng</p>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handlePlayChess} style={{ background:"linear-gradient(135deg,#8B6914,#FFD700)", color:"#1a0a00", border:"none", borderRadius:10, padding:"8px 18px", fontSize:12, fontWeight:800, cursor:"pointer" }}>♟ Tìm đối thủ</button>
              <button onClick={() => requireMember(() => setShowChessLB(true))} style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)", color:"#FFD700", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>🏆 BXH</button>
            </div>
          </div>
        </div>
      </div>

      {showBoard     && <GameLeaderboard gameKey={showBoard} onClose={() => setShowBoard(null)} />}
      {showChessLB   && <ChessLeaderboard onClose={() => setShowChessLB(false)} />}
      {showAlltimeLB && <AlltimeLeaderboard onClose={() => setShowAlltimeLB(false)} />}

      {showAuthModal && (
        <>
          <div onClick={() => setShowAuthModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:100 }}/>
          <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:101, background:"white", borderRadius:"24px 24px 0 0", padding:"32px 24px 48px", textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎮</div>
            <h2 style={{ fontSize:20, fontWeight:900, color:"#1a1a1a", margin:"0 0 8px" }}>Đăng nhập để chơi game</h2>
            <p style={{ fontSize:14, color:"#666", margin:"0 0 24px", lineHeight:1.6 }}>Bạn cần đăng nhập qua Zalo để chơi game và lưu điểm số của mình</p>
            <button onClick={() => setShowAuthModal(false)} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"#D4531C", color:"white", fontSize:15, fontWeight:900, cursor:"pointer" }}>Đã hiểu</button>
          </div>
        </>
      )}
      {/* Community Chat Button — draggable */}
      <DraggableChatButton onClick={() => requireMember(() => setShowChat(true))} />
    </div>
  );
}
