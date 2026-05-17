/**
 * =====================================================
 * REALTIME CONFLICT RESOLVER
 * =====================================================
 */

export function resolveRealtimeConflict({

  localState,

  remoteState,

  strategy =
    "server_wins",

}) {

  switch (strategy) {

    case "client_wins":

      return localState;

    case "merge":

      return {

        ...remoteState,

        ...localState,

      };

    case "server_wins":

    default:

      return remoteState;

  }

}