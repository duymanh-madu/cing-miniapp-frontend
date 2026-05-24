import {

  bindGamificationRealtime,

} from "./realtimeGamificationBinder";

import {

  initializeRealtimeStateSync,

} from "../state/realtimeStateSyncGateway";

/**
 * =====================================================
 * GAMIFICATION REALTIME LIFECYCLE
 * =====================================================
 */

let initialized =
  false;

export async function initializeGamificationRealtime({

  hydrate,

  recover,

  getState,

}) {

  if (initialized) {

    return;

  }

  bindGamificationRealtime();

  await initializeRealtimeStateSync({

    hydrate,

    recover,

    getState,

  });

  initialized =
    true;

  console.log(
    "🎮 Gamification realtime initialized"
  );

}