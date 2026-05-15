class DistributedTracingRuntime {

  traces =
    [];

  startTrace({
    traceId,
    name,
  }) {

    this.traces.push({

      traceId,

      name,

      startedAt:
        Date.now(),

    });

  }

  completeTrace(
    traceId
  ) {

    const trace =
      this.traces.find(
        (
          item
        ) =>
          item.traceId ===
          traceId
      );

    if (
      trace
    ) {

      trace.completedAt =
        Date.now();

    }

  }

}

const distributedTracingRuntime =
  new DistributedTracingRuntime();

export default
  distributedTracingRuntime;