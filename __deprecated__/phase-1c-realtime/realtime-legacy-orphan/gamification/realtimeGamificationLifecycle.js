/**
 * =====================================================
 * LEGACY SOCKET BINDER REMOVED
 * =====================================================
 * Realtime transport ownership migrated to:
 * runtime/socket/runtimeSocketClient
 * =====================================================
 */

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