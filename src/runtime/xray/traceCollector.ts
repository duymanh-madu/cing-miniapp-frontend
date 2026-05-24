class TraceCollector {

  private traces: any[] = [];

  start(event: string, payload: any) {

    const trace = {
      id: Math.random().toString(36).substring(7),
      event,
      payload,
      start: Date.now(),
      steps: [],
    };

    this.traces.push(trace);

    return trace;

  }

  step(trace: any, name: string, data?: any) {

    trace.steps.push({
      name,
      data,
      time: Date.now(),
    });

  }

  end(trace: any) {

    trace.end = Date.now();
    trace.duration = trace.end - trace.start;

  }

  getAll() {
    return this.traces;
  }

}

export const traceCollector = new TraceCollector();
