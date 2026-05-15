import ecosystemService from "./ecosystemService";

import useEcosystemStore from "./ecosystemStore";

class EcosystemBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useEcosystemStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        ecosystemApps,

        federationRuntime,

        ecosystemMetrics,

      ] = await Promise.all([

        ecosystemService
          .getEcosystemApps(),

        ecosystemService
          .getFederationRuntime(),

        ecosystemService
          .getEcosystemMetrics(),

      ]);

      store.setEcosystemApps(
        ecosystemApps
      );

      store.setFederationRuntime(
        federationRuntime
      );

      store.setEcosystemMetrics(
        ecosystemMetrics
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

const ecosystemBootstrap =
  new EcosystemBootstrap();

export default
  ecosystemBootstrap;