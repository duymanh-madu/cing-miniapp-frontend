import runtimeExecutionEngine from "@/core/runtime/runtimeExecutionEngine";

class OrchestrationEngine {

  async executeFlow(
    flow = [],
    context = {}
  ) {

    const results =
      [];

    for (
      const runtime
      of flow
    ) {

      const result =
        await runtimeExecutionEngine
          .execute(
            runtime,
            context
          );

      results.push(
        result
      );

    }

    return results;

  }

}

const orchestrationEngine =
  new OrchestrationEngine();

export default
  orchestrationEngine;