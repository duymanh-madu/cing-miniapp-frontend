/**
 * =====================================================
 * REALTIME COMBO HANDLER
 * =====================================================
 */

export function realtimeComboHandler({

  payload,

  gamificationStore,

}) {

  if (!payload) {

    return;

  }

  gamificationStore
    .getState()
    .setCombo({

      combo:
        payload.combo,

      multiplier:
        payload.multiplier,

    });

  console.log(
    "🔥 Combo updated"
  );

}