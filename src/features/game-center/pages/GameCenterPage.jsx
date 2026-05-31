import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import CommunityChat from "../components/CommunityChat";
import { getAllGames } from "@/games/registry/gameRegistry";
import BlackPearlRush from "@/games/black-pearl-rush/BlackPearlRush";
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

export default function GameCenterPage() {
  const games = getAllGames();
  const [activeGame, setActiveGame]       = useState(null);
  const [playingChess, setPlayingChess]   = useState(false);
  const [showBoard, setShowBoard]         = useState(null);
  const [showChessLB, setShowChessLB]     = useState(false);
  const [showAlltimeLB, setShowAlltimeLB] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [challenge, setChallenge]         = useState(null);
  const [gamePlays, setGamePlays]         = useState(null);
  const [showChat, setShowChat]           = useState(false);

  const authenticated = useAuthStore(s => s.authenticated);
  const profile       = useAuthStore(s => s.profile);

  useEffect(() => {
    apiClient.get("/game/daily-challenge")
      .then(r => setChallenge(r.data?.data))
      .catch(() => {});
  }, []);

  // Socket: challenge winner
  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.on("challenge.won", (data) => {
          setChallenge(prev => prev ? { ...prev, completed: true, winner_name: data?.payload?.winner_name } : prev);
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
    const playerName = useAuthStore.getState().profile?.name || profile?.name || "Cing iu";
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
        if (res.data?.success) alert("🏆 " + res.data.message);
      } catch(e) {}
    }
  };

  const handlePlayGame = (gameId) => {
    if (!authenticated) { setShowAuthModal(true); return; }
    if (gamePlays !== null && gamePlays <= 0) {
      alert("Hết lượt chơi! Hãy đặt hàng để nhận thêm lượt."); return;
    }
    const phone = getPhone();
    if (phone) {
      apiClient.post("/game/use-play", { user_id: phone }).catch(e => console.warn("[GAME] use-play:", e.message));
    }
    setActiveGame(gameId);
  };

  const handlePlayChess = () => {
    if (!authenticated) { setShowAuthModal(true); return; }
    if (gamePlays !== null && gamePlays <= 0) { alert("Hết lượt chơi!"); return; }
    const phone = getPhone();
    if (phone) {
      apiClient.post("/game/use-play", { user_id: phone }).catch(() => {});
    }
    setPlayingChess(true);
  };

  if (showChat) return <CommunityChat onClose={() => setShowChat(false)} />;
  if (playingChess) return <ChessGame onExit={() => setPlayingChess(false)} />;

  if (activeGame) {
    const game     = games.find(g => g.id === activeGame);
    const GameComp = game?.component || BlackPearlRush;
    return (
      <>
        <GameComp
          onExit={() => setActiveGame(null)}
          onGameOver={handleGameOver}
          onShowLeaderboard={() => setShowBoard(activeGame)}
        />
        {showBoard && <GameLeaderboard gameKey={showBoard} onClose={() => setShowBoard(null)} />}
      </>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#0a0a0f 0%,#12071a 50%,#0d0d1a 100%)", paddingBottom:100 }}>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:"var(--app-safe-top, 0px)", background:"#0a0a0f", zIndex:99 }} />
      {/* HEADER */}
      <div style={{ padding:"24px 20px 16px", textAlign:"center" }}>
        <p style={{ color:"rgba(255,215,0,0.6)", fontSize:11, letterSpacing:4, fontWeight:700, margin:"0 0 6px", textTransform:"uppercase" }}>Cing Hu Tang Kinh Bắc</p>
        <h1 style={{ color:"white", fontSize:28, fontWeight:900, margin:0, letterSpacing:2, textShadow:"0 0 40px rgba(255,215,0,0.3)" }}>GAME CENTER</h1>
        <button onClick={() => setShowAlltimeLB(true)} style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)", color:"#FFD700", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:800, cursor:"pointer", marginTop:8 }}>🏆 Kỷ lục alltime</button>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, margin:"6px 0 0" }}>Nơi các Cing iu thoả sức so tài</p>
      </div>

      {/* DAILY CHALLENGE */}
      <div style={{ margin:"0 16px 20px", background: challenge?.completed ? "linear-gradient(135deg,rgba(76,175,80,0.15),rgba(76,175,80,0.05))" : "linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,140,0,0.08))", border: challenge?.completed ? "1px solid rgba(76,175,80,0.3)" : "1px solid rgba(255,215,0,0.2)", borderRadius:20, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: challenge?.completed ? 10 : 0 }}>
          <div>
            <p style={{ color: challenge?.completed ? "#4CAF50" : "#FFD700", fontSize:11, fontWeight:800, margin:"0 0 4px", letterSpacing:2 }}>{challenge?.completed ? "✅ ĐÃ CÓ NGƯỜI NHẬN THƯỞNG" : "🎯 THÁCH THỨC HÔM NAY"}</p>
            <p style={{ color:"white", fontSize:15, fontWeight:800, margin:"0 0 3px" }}>Đạt combo {challenge?.target_value || 100} trong game "Bay cùng trân châu"</p>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, margin:0 }}>Phần thưởng: +{challenge?.reward_points || 50} điểm tích luỹ • Chỉ 1 người đầu tiên</p>
          </div>
          <div style={{ fontSize:36 }}>{challenge?.completed ? "🏆" : "🎯"}</div>
        </div>
        {challenge?.completed && challenge?.winner_name && (
          <div style={{ background:"rgba(76,175,80,0.1)", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>👑</span>
            <p style={{ color:"#4CAF50", fontSize:12, fontWeight:700, margin:0 }}>Chúc mừng <strong>{challenge.winner_name}</strong> đã xuất sắc nhận được phần thưởng thử thách ngày!</p>
          </div>
        )}
      </div>

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
              <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, margin:"0 0 12px" }}>Thử thách phản xạ — ghi điểm cao nhất</p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => handlePlayGame(game.id)} style={{ background:"linear-gradient(135deg,#D4531C,#ff6b35)", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:12, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 15px rgba(212,83,28,0.4)" }}>Chơi ngay</button>
                <button onClick={() => setShowBoard(game.id)} style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)", color:"#FFD700", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>🏆 BXH</button>
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
              <button onClick={() => setShowChessLB(true)} style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.3)", color:"#FFD700", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>🏆 BXH</button>
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
      {/* Community Chat Button */}
      <button onClick={() => setShowChat(true)}
        style={{ position:"fixed", bottom:80, right:16, zIndex:9999,
          width:52, height:52, borderRadius:26, border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#D4531C,#FF6B35)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:22, boxShadow:"0 4px 16px rgba(212,83,28,0.5)" }}>
        💬
      </button>
    </div>
  );
}
