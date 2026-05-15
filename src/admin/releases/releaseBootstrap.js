import releaseService from "./releaseService";

import useReleaseStore from "./releaseStore";

class ReleaseBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const [

      releases,

      environmentStatus,

    ] = await Promise.all([

      releaseService
        .getReleases(),

      releaseService
        .getEnvironmentStatus(),

    ]);

    const store =
      useReleaseStore
        .getState();

    store.setReleases(
      releases
    );

    store.setEnvironmentStatus(
      environmentStatus
    );

    this.initialized =
      true;

  }

}

const releaseBootstrap =
  new ReleaseBootstrap();

export default
  releaseBootstrap;