import leaderboardStore from "@/stores/leaderboardStore";

/**
 * 🏆 LEADERBOARD ENGINE (FIXED FOR REAL ARCH)
 */

class LeaderboardEngine {
  update(gameId, entries) {
    leaderboardStore.getState().setEntries(gameId, entries);
  }

  pushScore(gameId, player) {
    leaderboardStore.getState().updateScore(gameId, player);
  }
}

export default new LeaderboardEngine();