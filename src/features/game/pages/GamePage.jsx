import GameLoader from "@/game-system/loaders/GameLoader";
import { useSearchParams } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";
import apiClient from "@/infra/api/apiClient";

export default function GamePage() {
  const [params] = useSearchParams();
  const gameId = params.get("id") || "black-pearl-rush";
  const profile = useAuthStore(s => s.profile);

  const handleGameOver = async ({ bestCombo, score }) => {
    // Lấy profile mới nhất từ store
    const currentProfile = useAuthStore.getState().profile;
    const userId = currentProfile?.id || currentProfile?.zalo_id || profile?.id || profile?.zalo_id;
    console.log("[GAME] handleGameOver called, userId:", userId, "score:", score, "combo:", bestCombo);
    if (!userId) {
      console.warn("[GAME] No userId found, skip submit");
      return;
    }

    const finalScore = score || bestCombo || 0;
    if (!finalScore) return;

    try {
      // Save score vào leaderboard
      await apiClient.post("/game/score", {
        game_key: gameId,
        user_id: userId,
        score: finalScore,
        player_name: currentProfile?.name || currentProfile?.displayName || "Cing iu",
        avatar: currentProfile?.avatar || "",
        combo: bestCombo || 0,
      });
    } catch(e) {
      console.warn("[GAME] submit score failed:", e.message);
    }

    // Claim daily challenge nếu đủ combo
    try {
      await apiClient.post("/game/daily-challenge/claim", {
        user_id: userId,
        player_name: currentProfile?.name || currentProfile?.displayName || "Cing iu",
        avatar: currentProfile?.avatar || "",
        combo: bestCombo || 0,
        game_key: gameId,
      });
    } catch(e) {}
  };

  return <GameLoader gameId={gameId} onGameOver={handleGameOver} />;
}
