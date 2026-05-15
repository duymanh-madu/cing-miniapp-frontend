import runtimeRegistry from "@/core/runtime/runtimeRegistry";

import runtimeLifecycleManager from "@/core/runtime/runtimeLifecycleManager";

class RuntimeEngineBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const runtimes =
      runtimeRegistry
        .getAll();

    for (
      const [
        key,
        runtime,
      ]
      of runtimes
    ) {

      await runtimeLifecycleManager
        .boot(
          runtime
        );

    }

    this.initialized =
      true;

  }

}

const runtimeEngineBootstrap =
  new RuntimeEngineBootstrap();

export default
  runtimeEngineBootstrap;