import GameLoader from "@/game-system/loaders/GameLoader";
import { useSearchParams } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";
import apiClient from "@/infra/api/apiClient";

export default function GamePage() {
  const [params] = useSearchParams();
  const gameId = params.get("id") || "black-pearl-rush";
  const profile = useAuthStore(s => s.profile);

  const handleGameOver = async ({ bestCombo, score }) => {
    const userId = profile?.id || profile?.zalo_id;
    if (!userId) return;

    const finalScore = score || bestCombo || 0;
    if (!finalScore) return;

    try {
      // Save score vào leaderboard
      await apiClient.post("/game/score", {
        game_key: gameId,
        user_id: userId,
        score: finalScore,
        player_name: profile?.name || profile?.displayName || "Cing iu",
        avatar: profile?.avatar || "",
        combo: bestCombo || 0,
      });
    } catch(e) {
      console.warn("[GAME] submit score failed:", e.message);
    }

    // Claim daily challenge nếu đủ combo
    try {
      await apiClient.post("/game/daily-challenge/claim", {
        user_id: userId,
        player_name: profile?.name || profile?.displayName || "Cing iu",
        avatar: profile?.avatar || "",
        combo: bestCombo || 0,
        game_key: gameId,
      });
    } catch(e) {}
  };

  return <GameLoader gameId={gameId} onGameOver={handleGameOver} />;
}
