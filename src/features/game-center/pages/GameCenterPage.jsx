import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllGames } from "@/games/registry/gameRegistry";
import BlackPearlRush from "@/games/black-pearl-rush/BlackPearlRush";
import GameLeaderboard from "../components/GameLeaderboard";
import GamePlaysCard from "../components/GamePlaysCard";

export default function GameCenterPage() {
  const games = getAllGames();
  const [activeGame, setActiveGame] = useState(null);
  const [showBoard, setShowBoard] = useState(null);
  const [gamePlays, setGamePlays] = useState(null);
  const navigate = useNavigate();

  if (activeGame) {
    const game = games.find(g => g.id === activeGame);
    const GameComp = game?.component || BlackPearlRush;
    return (
      <div style={{ background:"#000", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 16px", background:"rgba(255,255,255,0.05)" }}>
          <button onClick={() => setActiveGame(null)}
            style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"white",
              borderRadius:10, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>
            ← Hub
          </button>
          <span style={{ color:"white", fontWeight:800, fontSize:14 }}>{game?.displayName || game?.name}</span>
          <button onClick={() => setShowBoard(activeGame)}
            style={{ background:"rgba(255,215,0,0.15)", border:"1px solid rgba(255,215,0,0.4)",
              color:"#FFD700", borderRadius:10, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:700 }}>
            🏆 BXH
          </button>
        </div>
        <div style={{ flex:1 }}><GameComp onExit={() => setActiveGame(null)} /></div>
        {showBoard && <GameLeaderboard gameKey={showBoard} onClose={() => setShowBoard(null)} />}
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(180deg,#0a0a0f 0%,#12071a 50%,#0d0d1a 100%)",
      paddingBottom:100 }}>

      {/* HEADER */}
      <div style={{ padding:"24px 20px 16px", textAlign:"center" }}>
        <p style={{ color:"rgba(255,215,0,0.6)", fontSize:11, letterSpacing:4,
          fontWeight:700, margin:"0 0 6px", textTransform:"uppercase" }}>
          Cing Hu Tang Kinh Bắc
        </p>
        <h1 style={{ color:"white", fontSize:28, fontWeight:900, margin:0,
          letterSpacing:2, textShadow:"0 0 40px rgba(255,215,0,0.3)" }}>
          GAME CENTER
        </h1>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, margin:"6px 0 0" }}>
          Nơi các Cing iu thoả sức so tài
        </p>
      </div>

      {/* DAILY CHALLENGE */}
      <div style={{ margin:"0 16px 20px",
        background:"linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,140,0,0.08))",
        border:"1px solid rgba(255,215,0,0.2)", borderRadius:20, padding:"16px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ color:"#FFD700", fontSize:11, fontWeight:800, margin:"0 0 4px", letterSpacing:2 }}>
            THÁCH THỨC HÔM NAY
          </p>
          <p style={{ color:"white", fontSize:15, fontWeight:800, margin:"0 0 3px" }}>
            Ghi 500 điểm Bay cùng trân châu
          </p>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, margin:0 }}>
            Phần thưởng: +50 điểm tích luỹ
          </p>
        </div>
        <div style={{ fontSize:36 }}>🎯</div>
      </div>

      <GamePlaysCard onPlaysUpdate={setGamePlays} />

      {/* GAME LIST */}
      <div style={{ padding:"0 16px" }}>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700,
          letterSpacing:3, margin:"0 0 12px", textTransform:"uppercase" }}>Trò Chơi</p>

        {games.map(game => (
          <div key={game.id} style={{
            background:"linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
            border:"1px solid rgba(255,255,255,0.08)", borderRadius:20,
            padding:"20px", marginBottom:12,
            display:"flex", alignItems:"center", gap:16,
          }}>
            <div style={{
              width:64, height:64, borderRadius:18, flexShrink:0,
              background:"linear-gradient(135deg,#1a0a2e,#2d1254)",
              border:"1px solid rgba(255,215,0,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
            }}>🎮</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <p style={{ color:"white", fontSize:15, fontWeight:800, margin:0 }}>
                  {game.displayName || game.name}
                </p>
                {game.status==="LIVE" && (
                  <span style={{ background:"rgba(0,255,100,0.15)", color:"#00ff64",
                    fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:8, letterSpacing:1 }}>LIVE</span>
                )}
              </div>
              <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, margin:"0 0 12px" }}>
                Thử thách phản xạ — ghi điểm cao nhất
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => {
                  if (gamePlays !== null && gamePlays <= 0) {
                    alert("Hết lượt chơi! Hãy đặt hàng để nhận thêm lượt.");
                    return;
                  }
                  setActiveGame(game.id);
                }} style={{
                  background:"linear-gradient(135deg,#D4531C,#ff6b35)",
                  color:"white", border:"none", borderRadius:10,
                  padding:"8px 18px", fontSize:12, fontWeight:800, cursor:"pointer",
                  boxShadow:"0 4px 15px rgba(212,83,28,0.4)",
                }}>Chơi ngay</button>
                <button onClick={() => setShowBoard(game.id)} style={{
                  background:"rgba(255,215,0,0.1)",
                  border:"1px solid rgba(255,215,0,0.3)",
                  color:"#FFD700", borderRadius:10,
                  padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer",
                }}>🏆 BXH</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showBoard && <GameLeaderboard gameKey={showBoard} onClose={() => setShowBoard(null)} />}
    </div>
  );
}
