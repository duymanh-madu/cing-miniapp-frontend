import runtimeConfigService from "@/services/runtime/runtimeConfigService";

import realtimeEventRouter from "@/services/realtime/realtimeEventRouter";

import realtimeChannelRegistry from "@/services/realtime/realtimeChannelRegistry";

import socketManager from "@/services/socket/socketManager";

import runtimeFeatureBootstrap from "@/services/runtime/runtimeFeatureBootstrap";

import useSystemStore from "@/stores/systemStore";

class RuntimeBootstrapper {

  initialized = false;

  booting = false;

  async bootstrap() {

    if (
      this.initialized ||
      this.booting
    ) {

      return;

    }

    try {

      this.booting = true;

      await runtimeConfigService.load();

      socketManager.connect();

      realtimeChannelRegistry.register({
        channel: "system",
      });

      realtimeEventRouter.start();

      runtimeFeatureBootstrap.bootstrap();

      useSystemStore.setState({

        runtimeReady: true,

        runtimeBootedAt:
          Date.now(),

      });

      this.initialized = true;

    } catch (error) {

      console.error(
        "[RUNTIME BOOTSTRAP ERROR]",
        error
      );

      useSystemStore.setState({

        runtimeError:
          error?.message ||
          "Runtime bootstrap failed",

      });

    } finally {

      this.booting = false;

    }

  }

}

const runtimeBootstrapper =
  new RuntimeBootstrapper();

export default
  runtimeBootstrapper;