import socket from "./socket";

const listeners =
  new Map();

function emit(
  event,
  payload
) {

  const handlers =
    listeners.get(
      event
    ) || [];

  handlers.forEach(
    (handler) => {

      handler(
        payload
      );

    }
  );

}

function on(
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
      []
    );

  }

  listeners
    .get(event)
    .push(callback);

  return () => {

    const next =
      listeners
        .get(event)
        .filter(
          (
            handler
          ) =>

            handler !==
            callback
        );

    listeners.set(
      event,
      next
    );

  };

}

socket.onAny(
  (
    event,
    payload
  ) => {

    emit(
      event,
      payload
    );

  }
);

export {

  on,

};