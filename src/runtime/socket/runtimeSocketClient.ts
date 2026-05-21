import { io } from "socket.io-client";

import {
  useRuntimeSystemStore,
} from "../../stores/runtime/runtimeSystemStore";

let runtimeSocket: any = null;

export function initializeRuntimeSocket() {

  console.log(
    "[SOCKET] INITIALIZING..."
  );

  if (
    runtimeSocket
  ) {

    return runtimeSocket;

  }

  runtimeSocket = io(
    "http://localhost:5050"
  );

  runtimeSocket.on(
    "connect",
    () => {

      console.log(
        "[SOCKET] CONNECT SUCCESS"
      );

      useRuntimeSystemStore
        .getState()
        .setConnected(
          true
        );

    }
  );

  return runtimeSocket;

}
export function getRuntimeSocket() {

  return runtimeSocket;

}