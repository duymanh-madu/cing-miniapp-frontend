class EventStore {

  private events: any[] = [];

  append(event: any) {
    this.events.push({
      ...event,
      storedAt: Date.now(),
    });
  }

  replay() {
    return [...this.events];
  }

}

export const eventStore = new EventStore();
