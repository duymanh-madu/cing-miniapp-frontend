import observabilityService from "./observabilityService";

import useObservabilityStore from "./observabilityStore";

class ObservabilityBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useObservabilityStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        systemHealth,

        infrastructureMetrics,

        queueMetrics,

        websocketMetrics,

        activeIncidents,

      ] = await Promise.all([

        observabilityService
          .getSystemHealth(),

        observabilityService
          .getInfrastructureMetrics(),

        observabilityService
          .getQueueMetrics(),

        observabilityService
          .getWebsocketMetrics(),

        observabilityService
          .getActiveIncidents(),

      ]);

      store.setSystemHealth(
        systemHealth
      );

      store.setInfrastructureMetrics(
        infrastructureMetrics
      );

      store.setQueueMetrics(
        queueMetrics
      );

      store.setWebsocketMetrics(
        websocketMetrics
      );

      store.setActiveIncidents(
        activeIncidents
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

const observabilityBootstrap =
  new ObservabilityBootstrap();

export default
  observabilityBootstrap;