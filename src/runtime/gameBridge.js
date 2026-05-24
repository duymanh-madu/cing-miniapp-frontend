import gameRuntime from "@/runtime/gameRuntime";
import leaderboardRuntime from "@/runtime/leaderboardRuntime";
import eventBus from "@/runtime/eventBus";

/**
 * ============================================
 * GAME BRIDGE (CORE CONNECTOR)
 * ============================================
 */

class GameBridge {
  init() {
    /**
     * GAME SCORE → LEADERBOARD PIPELINE
     */
    eventBus.on("GAME_SCORE", (payload) => {
      leaderboardRuntime.update(payload.leaderboard);
    });

    /**
     * OPTIONAL: REALTIME SYNC
     */
    eventBus.on("GAME_END", (payload) => {
      leaderboardRuntime.update(payload.leaderboard);
    });
  }

  emitScore(gameId, score) {
    gameRuntime.emitScore(gameId, score);

    eventBus.emit("GAME_SCORE", {
      gameId,
      score,
    });
  }
}

export default new GameBridge();