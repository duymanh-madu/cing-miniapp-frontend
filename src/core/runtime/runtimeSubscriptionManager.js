import eventBus from "@/core/events/eventBus";

class RuntimeSubscriptionManager {

  subscriptions =
    [];

  subscribe({
    event,
    handler,
  }) {

    const unsubscribe =
      eventBus.subscribe(
        event,
        handler
      );

    this.subscriptions.push(
      unsubscribe
    );

    return unsubscribe;

  }

  clearAll() {

    this.subscriptions.forEach(
      (
        unsubscribe
      ) => {

        unsubscribe();

      }
    );

    this.subscriptions =
      [];

  }

}

const runtimeSubscriptionManager =
  new RuntimeSubscriptionManager();

export default
  runtimeSubscriptionManager;