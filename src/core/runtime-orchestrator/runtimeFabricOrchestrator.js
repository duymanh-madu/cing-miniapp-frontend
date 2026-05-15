import runtimeDiscoveryEngine from "@/core/runtime-discovery/runtimeDiscoveryEngine";

import runtimeExecutionEngine from "@/core/runtime/runtimeExecutionEngine";

class RuntimeFabricOrchestrator {

  async orchestrate({
    tags = [],
    payload,
  }) {

    const runtimes =
      runtimeDiscoveryEngine
        .discover({
          tags,
        });

    const results =
      [];

    for (
      const runtime
      of runtimes
    ) {

      const result =
        await runtimeExecutionEngine
          .execute(
            runtime,
            payload
          );

      results.push(
        result
      );

    }

    return results;

  }

}

const runtimeFabricOrchestrator =
  new RuntimeFabricOrchestrator();

export default
  runtimeFabricOrchestrator;