/**
 * =====================================================
 * REALTIME LEADERBOARD HANDLER
 * =====================================================
 */

export function realtimeLeaderboardHandler({

  payload,

  leaderboardStore,

}) {

  if (!payload) {

    return;

  }

  leaderboardStore
    .getState()
    .setLeaderboard(

      payload.leaderboard
    );

  console.log(
    "📈 Leaderboard updated"
  );

}