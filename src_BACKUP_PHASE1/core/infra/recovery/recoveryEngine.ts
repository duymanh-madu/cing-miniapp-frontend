import { eventStore } from "../event-store/eventStore";

class RecoveryEngine {

  recover() {

    const events = eventStore.replay();

    return {
      recoveredEvents: events.length,
      status: "RECOVERED",
    };

  }

}

export const recoveryEngine = new RecoveryEngine();
