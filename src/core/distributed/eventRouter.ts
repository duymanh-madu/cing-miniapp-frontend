import { BaseEvent } from "./eventContract";

class EventRouter {

  route(event: BaseEvent) {

    // isolate by store (critical for multi-branch)
    const key = `store:${event.storeId}`;

    return {
      key,
      event,
    };

  }

}

export const eventRouter = new EventRouter();
