import eventBus from "@/core/events/eventBus";

class RuntimeHealthMonitor {

  runtimeHealth =
    new Map();

  markHealthy(
    runtime
  ) {

    this.runtimeHealth.set(
      runtime,
      {
        status:
          "healthy",

        timestamp:
          Date.now(),
      }
    );

    eventBus.publish(

      "runtime.health.updated",

      {
        runtime,
        status:
          "healthy",
      }

    );

  }

  markUnhealthy(
    runtime
  ) {

    this.runtimeHealth.set(
      runtime,
      {
        status:
          "unhealthy",

        timestamp:
          Date.now(),
      }
    );

    eventBus.publish(

      "runtime.health.updated",

      {
        runtime,
        status:
          "unhealthy",
      }

    );

  }

  getHealth(
    runtime
  ) {

    return this.runtimeHealth.get(
      runtime
    );

  }

}

const runtimeHealthMonitor =
  new RuntimeHealthMonitor();

export default
  runtimeHealthMonitor;