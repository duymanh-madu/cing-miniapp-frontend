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
    const playerName = profile?.name || profile?.displayName || "Cing iu";
    if (!userId || !bestCombo) return;
    try {
      await apiClient.post("/game/daily-challenge/claim", {
        user_id: userId,
        player_name: playerName,
        avatar: profile?.avatar || "",
        combo: bestCombo,
        game_key: gameId,
      });
    } catch(e) {}
  };

  return <GameLoader gameId={gameId} onGameOver={handleGameOver} />;
}
