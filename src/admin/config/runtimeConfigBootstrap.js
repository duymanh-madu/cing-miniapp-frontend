import runtimeConfigService from "./runtimeConfigService";

import useRuntimeConfigStore from "./runtimeConfigStore";

class RuntimeConfigBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useRuntimeConfigStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const config =
        await runtimeConfigService
          .load();

      store.setConfig(
        config
      );

    } finally {

      store.setLoading(
        false
      );

      this.initialized =
        true;

    }

  }

}

const runtimeConfigBootstrap =
  new RuntimeConfigBootstrap();

export default
  runtimeConfigBootstrap;