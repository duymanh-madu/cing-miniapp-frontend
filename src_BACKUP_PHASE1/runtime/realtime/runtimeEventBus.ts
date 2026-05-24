import {

  getRuntimeSocket,

  registerSocketListener,

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

    return () => {};

  }

  const unsubscribe =
    registerSocketListener(
      event,
      callback as any
    );

  registerRuntimeSubscription(
    event,
    callback
  );

  return unsubscribe;

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
