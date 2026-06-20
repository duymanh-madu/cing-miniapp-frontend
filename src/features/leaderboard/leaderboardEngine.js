import leaderboardStore from "@/features/leaderboard/store/leaderboardStore";

/**
 * =====================================================
 * LEADERBOARD ENGINE - PRODUCTION CORE
 * =====================================================
 * - Single source of truth
 * - Safe update pipeline
 * - Ready for socket + realtime injection
 * =====================================================
 */

class LeaderboardEngine {

  /**
   * Update leaderboard entries
   * @param {Array} entries
   */
  update(entries = []) {
    if (!Array.isArray(entries)) return;

    const normalized = this.normalize(entries);


    leaderboardStore.getState().setEntries(normalized);
  }

  /**
   * Normalize data for UI consistency
   */
  normalize(entries) {
    return entries
      .filter(Boolean)
      .map((item, index) => ({
        id: item.id || `lb_${index}_${Date.now()}`,
        name: item.name || "Unknown",
        score: Number(item.score || 0),
        rank: index + 1,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  /**
   * Inject realtime update (for socket future use)
   */
  pushRealtimeUpdate(payload) {
    if (!payload?.entries) return;
    this.update(payload.entries);
  }

  /**
   * Clear leaderboard
   */
  reset() {
    leaderboardStore.getState().setEntries([]);
  }
}

/**
 * SINGLETON INSTANCE
 */
const leaderboardEngine = new LeaderboardEngine();

export default leaderboardEngine;
