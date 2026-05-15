import iposRealtimeSync from "@/features/ipos/services/iposRealtimeSync";

class RuntimeFeatureBootstrap {

  initialized = false;

  bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    iposRealtimeSync.register();

    this.initialized = true;

  }

}

const runtimeFeatureBootstrap =
  new RuntimeFeatureBootstrap();

export default
  runtimeFeatureBootstrap;