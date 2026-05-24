import runtimeRegistry from "@/core/runtime/runtimeRegistry";

import runtimeLifecycleManager from "@/core/runtime/runtimeLifecycleManager";

class runtimeKernelBootstrap {

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

const runtimeKernelBootstrap =
  new runtimeKernelBootstrap();

export default
  runtimeKernelBootstrap;