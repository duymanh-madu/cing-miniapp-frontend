const runtimeSubscriptions =
  new Map();

export function registerRuntimeSubscription(
  event: string,
  callback: Function
) {

  runtimeSubscriptions.set(
    event,
    callback
  );

}

export function getRuntimeSubscriptions() {

  return runtimeSubscriptions;

}

export function removeRuntimeSubscription(
  event: string
) {

  runtimeSubscriptions.delete(
    event
  );

}