/**
 * =====================================================
 * REALTIME ACHIEVEMENT HANDLER
 * =====================================================
 */

export function realtimeAchievementHandler({

  payload,

  gamificationStore,

}) {

  if (!payload) {

    return;

  }

  gamificationStore
    .getState()
    .unlockAchievement(

      payload.achievement
    );

  console.log(
    "🎖 Achievement unlocked"
  );

}