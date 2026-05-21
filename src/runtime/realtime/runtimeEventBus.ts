import {
  getRuntimeSocket,
} from "../socket/runtimeSocketClient";

import {
  registerRuntimeSubscription,
} from "./runtimeSubscriptionRegistry";

export function subscribeRuntimeEvent(
  event: string,
  callback: Function
) {

  const socket =
    getRuntimeSocket();

  if (!socket) {

    return;

  }

  socket.on(
    event,
    callback
  );

  registerRuntimeSubscription(
    event,
    callback
  );

}

export function emitRuntimeEvent(
  event: string,
  payload?: any
) {

  const socket =
    getRuntimeSocket();

  if (!socket) {

    return;

  }

  socket.emit(
    event,
    payload
  );

}