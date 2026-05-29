import GameLoader from "@/game-system/loaders/GameLoader";
import { useSearchParams } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";

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

export default function GamePage() {
  const [params] = useSearchParams();
  const gameId = params.get("id") || "black-pearl-rush";

  const handleGameOver = async ({ bestCombo, score }) => {
    const phone      = getPhone();
    const profile    = useAuthStore.getState().profile;
    const userId     = phone || profile?.id || "";
    const playerName = profile?.name || "Cing iu";
    const finalScore = score || bestCombo || 0;
    if (!userId || !finalScore) return;

    try {
      await apiClient.post("/game/score", {
        game_key: gameId, user_id: userId, score: finalScore,
        player_name: playerName, avatar: profile?.avatar || "", combo: bestCombo || 0,
      });
    } catch(e) {}

    try {
      await apiClient.post("/game/daily-challenge/claim", {
        user_id: userId, player_name: playerName,
        avatar: profile?.avatar || "", combo: bestCombo || 0, game_key: gameId,
      });
    } catch(e) {}
  };

  return <GameLoader gameId={gameId} onGameOver={handleGameOver} />;
}
