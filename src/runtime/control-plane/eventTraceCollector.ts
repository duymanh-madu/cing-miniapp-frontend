class EventTraceCollector {

  private traces: any[] = [];

  record(event: string, payload: any) {

    this.traces.push({
      event,
      payload,
      timestamp: Date.now(),
    });

  }

  getAll() {
    return this.traces;
  }

  clear() {
    this.traces = [];
  }

}

export const eventTraceCollector = new EventTraceCollector();
