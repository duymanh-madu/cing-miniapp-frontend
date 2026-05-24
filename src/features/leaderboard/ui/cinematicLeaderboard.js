/**
 * ============================================
 * CINEMATIC LEADERBOARD ENGINE V4
 * ============================================
 * - Top 3 spotlight system
 * - smooth ranking transition
 * ============================================
 */

class CinematicLeaderboard {
  format(entries) {
    const sorted = [...entries].sort((a, b) => b.score - a.score);

    return {
      top3: sorted.slice(0, 3),
      rest: sorted.slice(3, 100),
    };
  }
}

export default new CinematicLeaderboard();