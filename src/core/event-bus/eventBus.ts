type EventHandler = (payload: any) => void | Promise<void>;

class EventBus {

  private handlers = new Map<string, EventHandler[]>();

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  async emit(event: string, payload: any) {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        console.error("[EVENT BUS ERROR]", event, err);
      }
    }
  }

  clear() {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
