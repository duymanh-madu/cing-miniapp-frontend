class Telemetry {

  private events: any[] = [];

  record(event: string, payload: any) {
    this.events.push({
      event,
      payload,
      timestamp: Date.now(),
    });
  }

  getAll() {
    return this.events;
  }

  clear() {
    this.events = [];
  }

}

export const telemetry = new Telemetry();
