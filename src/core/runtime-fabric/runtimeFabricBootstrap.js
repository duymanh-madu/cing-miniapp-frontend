import runtimeTelemetryBootstrap from "@/core/telemetry/runtimeTelemetryBootstrap";

import runtimeEngineBootstrap from "@/core/runtime-engine/runtimeEngineBootstrap";

import offlineRuntimeBootstrap from "@/core/offline-sync/offlineRuntimeBootstrap";

class RuntimeFabricBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    runtimeTelemetryBootstrap
      .initialize();

    await offlineRuntimeBootstrap
      .bootstrap();

    await runtimeEngineBootstrap
      .bootstrap();

    this.initialized =
      true;

  }

}

const runtimeFabricBootstrap =
  new RuntimeFabricBootstrap();

export default
  runtimeFabricBootstrap;