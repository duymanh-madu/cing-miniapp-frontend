class TelemetryRuntime {

  events =
    [];

  track({
    type,
    payload,
  }) {

    this.events.push({

      type,

      payload,

      timestamp:
        Date.now(),

    });

  }

  flush() {

    const events =
      [
        ...this.events,
      ];

    this.events =
      [];

    return events;

  }

}

const telemetryRuntime =
  new TelemetryRuntime();

export default
  telemetryRuntime;