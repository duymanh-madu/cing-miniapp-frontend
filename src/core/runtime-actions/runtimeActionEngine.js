import runtimeExecutionEngine from "@/core/runtime/runtimeExecutionEngine";

class RuntimeActionEngine {

  async executeActions({
    actions = [],
    payload,
  }) {

    const results =
      [];

    for (
      const action
      of actions
    ) {

      const result =
        await runtimeExecutionEngine
          .execute(
            action,
            payload
          );

      results.push(
        result
      );

    }

    return results;

  }

}

const runtimeActionEngine =
  new RuntimeActionEngine();

export default
  runtimeActionEngine;