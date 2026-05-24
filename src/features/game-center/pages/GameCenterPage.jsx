import { useMemo, useState } from "react";
import { getAllGames } from "@/games/registry/gameRegistry";
import BlackPearlRush from "@/games/black-pearl-rush/BlackPearlRush";

export default function GameCenterPage() {
  const games = useMemo(() => getAllGames(), []);
  const [activeGame, setActiveGame] = useState("black-pearl-rush");
  const ActiveGameComponent =
    games.find((g) => g.id === activeGame)?.component || BlackPearlRush;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* GAME SWITCHER - compact, không chiếm space */}
      {games.length > 1 && (
        <div className="flex gap-2 justify-center pt-3 pb-2 px-4 bg-black">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                activeGame === game.id
                  ? "bg-yellow-500 text-black font-bold"
                  : "bg-white/10 text-white"
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      )}

      {/* GAME AREA - full screen, không crop */}
      <div className="flex-1 flex items-start justify-center">
        <ActiveGameComponent />
      </div>
    </div>
  );
}
