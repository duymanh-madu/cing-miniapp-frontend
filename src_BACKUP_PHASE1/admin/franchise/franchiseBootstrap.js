import franchiseService from "./franchiseService";

import useFranchiseStore from "./franchiseStore";

class FranchiseBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useFranchiseStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        franchises,

        branchRealtimeMetrics,

        franchiseAnalytics,

      ] = await Promise.all([

        franchiseService
          .getFranchises(),

        franchiseService
          .getBranchMetrics(),

        franchiseService
          .getFranchiseAnalytics(),

      ]);

      store.setFranchises(
        franchises
      );

      store.setBranchRealtimeMetrics(
        branchRealtimeMetrics
      );

      store.setFranchiseAnalytics(
        franchiseAnalytics
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

const franchiseBootstrap =
  new FranchiseBootstrap();

export default
  franchiseBootstrap;