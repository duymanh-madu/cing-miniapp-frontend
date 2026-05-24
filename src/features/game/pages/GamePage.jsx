import GameLoader from "@/game-system/loaders/GameLoader";
import { useSearchParams } from "react-router-dom";

export default function GamePage() {
  const [params] = useSearchParams();
  const gameId = params.get("id") || "black-pearl-rush";
  return <GameLoader gameId={gameId} />;
}
