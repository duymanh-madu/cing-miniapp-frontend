import motionEngine from "@/runtime/animation/motionEngine";
import leaderboardRuntime from "@/runtime/leaderboardRuntime";

/**
 * ============================================
 * BROADCAST ENGINE V5
 * ============================================
 */

class BroadcastEngine {
  update(entries) {
    const prev = leaderboardRuntime.entries || [];

    leaderboardRuntime.update(entries);

    this.detectChanges(prev, entries);
  }

  detectChanges(prev, next) {
    next.forEach((user, index) => {
      const oldIndex = prev.findIndex((p) => p.id === user.id);

      if (oldIndex !== -1 && oldIndex > index) {
        motionEngine.rankUp(user);
      }

      if (index === 0 && user) {
        motionEngine.top1(user);
      }
    });
  }
}

export default new BroadcastEngine();