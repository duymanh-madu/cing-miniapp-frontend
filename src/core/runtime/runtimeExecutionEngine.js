import eventBus from "@/core/events/eventBus";

class RuntimeExecutionEngine {

  async execute(
    runtime,
    payload
  ) {

    if (
      !runtime
    ) {

      return;

    }

    try {

      eventBus.publish(

        "runtime.execution.started",

        {
          runtime:
            runtime.name,

          payload,
        }

      );

      const result =
        await runtime.execute(
          payload
        );

      eventBus.publish(

        "runtime.execution.completed",

        {
          runtime:
            runtime.name,

          result,
        }

      );

      return result;

    } catch (
      error
    ) {

      eventBus.publish(

        "runtime.execution.failed",

        {
          runtime:
            runtime.name,

          error,
        }

      );

      throw error;

    }

  }

}

const runtimeExecutionEngine =
  new RuntimeExecutionEngine();

export default
  runtimeExecutionEngine;