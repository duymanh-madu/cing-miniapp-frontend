import eventBus from "@/core/events/eventBus";

class RuntimeLifecycleManager {

  async boot(
    runtime
  ) {

    eventBus.publish(

      "runtime.lifecycle.booting",

      {
        runtime:
          runtime.name,
      }

    );

    if (
      runtime.boot
    ) {

      await runtime.boot();

    }

    eventBus.publish(

      "runtime.lifecycle.ready",

      {
        runtime:
          runtime.name,
      }

    );

  }

  async shutdown(
    runtime
  ) {

    eventBus.publish(

      "runtime.lifecycle.shutdown",

      {
        runtime:
          runtime.name,
      }

    );

    if (
      runtime.shutdown
    ) {

      await runtime.shutdown();

    }

  }

}

const runtimeLifecycleManager =
  new RuntimeLifecycleManager();

export default
  runtimeLifecycleManager;