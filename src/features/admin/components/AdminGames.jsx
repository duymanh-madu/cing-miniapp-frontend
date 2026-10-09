import AdminPlazaCharacterV7 from "./AdminPlazaCharacterV7.jsx";
import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";
import AdminGameGiftCatalog from "./AdminGameGiftCatalog";
import AdminReviveCreditPrice from "./AdminReviveCreditPrice";
import AdminReviveCreditAdjustmentV2 from "./AdminReviveCreditAdjustmentV2";

function isChessWinsGame(key, game) {
  return key === "chess-wins" || game?.score_label === "trận thắng";
}

function isChessStreakGame(key, game) {
  return key === "chess-streak" || game?.score_label === "chuỗi thắng";
}

function renderMetric(row, activeGame, currentGame) {
  if (isChessWinsGame(activeGame, currentGame)) {
    return (
      <div style={{ textAlign:"right", minWidth:130 }}>
        <div style={{ color:"#FFD700", fontSize:14, fontWeight:900 }}>
          {Number(row.wins || row.score || 0).toLocaleString()} thắng
        </div>
        <div style={{ color:"#888", fontSize:11 }}>
          {Number(row.winRate || row.win_rate || 0)}% tỷ lệ thắng
        </div>
      </div>
    );
  }

  if (isChessStreakGame(activeGame, currentGame)) {
    return (
      <div style={{ textAlign:"right", minWidth:130 }}>
        <div style={{ color:"#FFD700", fontSize:14, fontWeight:900 }}>
          {Number(row.best_streak || row.score || 0).toLocaleString()} trận
        </div>
        <div style={{ color:"#888", fontSize:11 }}>
          Chuỗi hiện tại: {Number(row.current_streak || 0)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign:"right", minWidth:130 }}>
      <div style={{ color:"#FFD700", fontSize:14, fontWeight:900 }}>
        {Number(row.score || 0).toLocaleString()} điểm
      </div>
    </div>
  );
}


export default function AdminGames({ token, role, adminId }) {
  const [games, setGames] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);


  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        const r = await apiClient.get("/game/leaderboard/alltime-games");
        const data = r.data?.data || [];

        if (!mounted) return;

        setGames(data);
        if (data.length > 0) setActiveGame(data[0].game_key);

        const scoreMap = Object.fromEntries(
          data.map(game => [
            game.game_key,
            Array.isArray(game.data)
              ? game.data
              : [],
          ])
        );

        if (mounted) setScores(scoreMap);
      } catch {
        if (mounted) setGames([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const currentGame = games.find(g => g.game_key === activeGame);
  const currentScores = scores[activeGame] || currentGame?.data || [];

  return (
    <div>
      <AdminPlazaCharacterV7 role={role} token={token} />
      <AdminReviveCreditPrice token={token} role={role} />
      <AdminGameGiftCatalog token={token} role={role} />
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>
        🎮 Quản lý Games
      </h2>

      <AdminReviveCreditAdjustmentV2
        token={token}
        role={role}
        adminId={adminId}
      />

      {loading ? (
        <p style={{ color:"#666" }}>Đang tải...</p>
      ) : (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {games.map(g => (
              <button
                key={g.game_key}
                onClick={() => setActiveGame(g.game_key)}
                style={{
                  background: activeGame === g.game_key ? "rgba(212,83,28,0.2)" : "#1a1a24",
                  border: `1px solid ${activeGame === g.game_key ? "#D4531C" : "#2a2a38"}`,
                  color: activeGame === g.game_key ? "#D4531C" : "#888",
                  borderRadius:10,
                  padding:"8px 16px",
                  fontSize:12,
                  fontWeight:700,
                  cursor:"pointer",
                }}
              >
                {g.icon} {g.display_name}
              </button>
            ))}
          </div>

          {currentGame && (
            <div style={{ background:"#1a1a24", borderRadius:14, border:"1px solid #2a2a38" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid #2a2a38", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ color:"white", fontWeight:800, margin:0 }}>
                  {currentGame.icon} {currentGame.display_name} — Top {currentScores.length}
                </p>
              </div>

              <div style={{ maxHeight:400, overflowY:"auto" }}>
                {currentScores.length === 0 ? (
                  <p style={{ color:"#666", padding:20, textAlign:"center" }}>
                    Chưa có dữ liệu
                  </p>
                ) : currentScores.map((s, i) => (
                  <div
                    key={`${activeGame}-${s.user_id}-${i}`}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px", borderBottom:"1px solid #12121a" }}
                  >
                    <span style={{ color:i < 3 ? "#FFD700" : "#666", fontSize:13, fontWeight:700, width:28, textAlign:"center" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `Top ${i + 1}`}
                    </span>

                    <div style={{ width:32, height:32, borderRadius:16, flexShrink:0, background:"linear-gradient(135deg,#1a0a2e,#2d1254)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"rgba(255,255,255,0.4)", overflow:"hidden" }}>
                      {s.avatar ? (
                        <img src={s.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      ) : (
                        (s.player_name || "?")[0]?.toUpperCase()
                      )}
                    </div>

                    <div style={{ flex:1 }}>
                      <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>
                        {s.player_name || "Cing iu"}
                      </p>
                      <p style={{ color:"#666", fontSize:11, margin:0 }}>
                        {s.user_id}
                      </p>
                    </div>

                    {renderMetric(s, activeGame, currentGame)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
