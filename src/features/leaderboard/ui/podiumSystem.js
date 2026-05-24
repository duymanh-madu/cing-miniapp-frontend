/**
 * ============================================
 * PODIUM SYSTEM V5 (TOP 3 CINEMATIC)
 * ============================================
 */

class PodiumSystem {
  format(entries) {
    const sorted = [...entries].sort((a, b) => b.score - a.score);

    return {
      first: sorted[0],
      second: sorted[1],
      third: sorted[2],
      rest: sorted.slice(3),
    };
  }
}

export default new PodiumSystem();