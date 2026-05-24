const listeners =
  new Map();

export function onRealtimeEvent(
  event,
  callback
) {

  if (
    !listeners.has(
      event
    )
  ) {

    listeners.set(
      event,
      new Set()
    );

  }

  listeners
    .get(event)
    .add(callback);

  return () => {

    listeners
      .get(event)
      ?.delete(callback);

  };

}

export function emitRealtimeEvent(
  event,
  payload
) {

  listeners
    .get(event)
    ?.forEach(
      (
        callback
      ) => {

        callback(
          payload
        );

      }
    );

}