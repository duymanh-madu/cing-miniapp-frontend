class EventBus {

  listeners =
    new Map();

  subscribe(
    event,
    callback
  ) {

    if (
      !this.listeners.has(
        event
      )
    ) {

      this.listeners.set(
        event,
        new Set()
      );

    }

    this.listeners
      .get(event)
      .add(callback);

    return () => {

      this.unsubscribe(
        event,
        callback
      );

    };

  }

  unsubscribe(
    event,
    callback
  ) {

    const listeners =
      this.listeners.get(
        event
      );

    if (
      !listeners
    ) {

      return;

    }

    listeners.delete(
      callback
    );

  }

  publish(
    event,
    payload
  ) {

    const listeners =
      this.listeners.get(
        event
      );

    if (
      !listeners
    ) {

      return;

    }

    listeners.forEach(
      (
        callback
      ) => {

        callback(
          payload
        );

      }
    );

  }

}

const eventBus =
  new EventBus();

export default
  eventBus;