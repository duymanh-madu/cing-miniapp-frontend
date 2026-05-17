import {

  hydrateRealtimeState,

} from "./realtimeHydrationEngine";

import {

  recoverRealtimeState,

} from "./reconnectStateRecovery";

import {

  persistRealtimeState,

} from "./realtimePersistenceEngine";

/**
 * =====================================================
 * REALTIME STATE SYNC GATEWAY
 * =====================================================
 */

export async function initializeRealtimeStateSync({

  hydrate,

  recover,

  getState,

}) {

  await hydrateRealtimeState({

    hydrate,

  });

  await recoverRealtimeState({

    recover,

  });

  persistRealtimeState(

    getState()

  );

  console.log(
    "⚡ Realtime state sync initialized"
  );

}