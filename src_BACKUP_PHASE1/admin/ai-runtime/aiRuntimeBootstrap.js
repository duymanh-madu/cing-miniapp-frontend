import aiRuntimeService from "./aiRuntimeService";

import useAiRuntimeStore from "./aiRuntimeStore";

class AiRuntimeBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useAiRuntimeStore
        .getState();

    const [

      runtimeModels,

      aiRuntimeMetrics,

    ] = await Promise.all([

      aiRuntimeService
        .getRuntimeModels(),

      aiRuntimeService
        .getRuntimeMetrics(),

    ]);

    store.setRuntimeModels(
      runtimeModels
    );

    store.setAiRuntimeMetrics(
      aiRuntimeMetrics
    );

    this.initialized =
      true;

  }

}

const aiRuntimeBootstrap =
  new AiRuntimeBootstrap();

export default
  aiRuntimeBootstrap;