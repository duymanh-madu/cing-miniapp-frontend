import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getAllGames } from "@/games/registry/gameRegistry";
import BlackPearlRush from "@/games/black-pearl-rush/BlackPearlRush";

/**
 * 🎮 GAME CENTER - AAA HUB FINAL
 * Mobile-first, scalable, multi-game system
 */

export default function GameCenterPage() {
  const games = useMemo(() => getAllGames(), []);
  const [activeGame, setActiveGame] = useState("black-pearl-rush");

  const ActiveGameComponent =
    games.find((g) => g.id === activeGame)?.component || BlackPearlRush;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white p-4">

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-widest">
          🎮 GAME CENTER
        </h1>
        <p className="text-xs text-white/60">
          Esports Runtime Hub
        </p>
      </div>

      {/* GAME SWITCHER */}
      <div className="flex gap-2 justify-center mb-6">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`
              px-3 py-1 rounded-full text-xs
              transition-all
              ${
                activeGame === game.id
                  ? "bg-yellow-500 text-black"
                  : "bg-white/10 text-white"
              }
            `}
          >
            {game.name}
          </button>
        ))}
      </div>

      {/* GAME AREA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-white/10"
      >
        <ActiveGameComponent />
      </motion.div>

      {/* LEADERBOARD ZONE (per-game ready) */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-2">
          🏆 Top 100 (Live Leaderboard)
        </h2>

        <div className="text-xs text-white/40">
          Leaderboard will connect per-game runtime here (ready for iPOS / Redis stream)
        </div>
      </div>

    </div>
  );
}