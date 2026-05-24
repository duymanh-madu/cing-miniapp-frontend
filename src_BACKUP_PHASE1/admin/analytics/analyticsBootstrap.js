import analyticsService from "./analyticsService";

import useAnalyticsStore from "./analyticsStore";

class AnalyticsBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useAnalyticsStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const metrics =
        await analyticsService
          .getDashboardMetrics();

      store.setMetrics(
        metrics
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

const analyticsBootstrap =
  new AnalyticsBootstrap();

export default
  analyticsBootstrap;