import realtimeSocket from "../socket";

import {
  useRealtimeConnectionStore,
} from "../store/realtimeConnectionStore";

export function initializeRealtimeManager() {

  realtimeSocket.on(
    "connect",
    () => {

      useRealtimeConnectionStore
        .getState()
        .setConnected(
          true
        );

      useRealtimeConnectionStore
        .getState()
        .setReconnecting(
          false
        );

    }
  );

  realtimeSocket.on(
    "disconnect",
    () => {

      useRealtimeConnectionStore
        .getState()
        .setConnected(
          false
        );

    }
  );

  realtimeSocket.on(
    "reconnect_attempt",
    () => {

      useRealtimeConnectionStore
        .getState()
        .setReconnecting(
          true
        );

    }
  );

}