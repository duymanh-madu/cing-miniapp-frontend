/**
 * =====================================================
 * REALTIME XP HANDLER
 * =====================================================
 */

export function realtimeXPHandler({

  payload,

  gamificationStore,

}) {

  if (!payload) {

    return;

  }

  gamificationStore
    .getState()
    .setXP({

      xp:
        payload.xp,

      earnedXP:
        payload.earnedXP,

    });

  console.log(
    "⚡ XP updated",
    payload
  );

}