import iposService from "./iposService";

import useIposStore from "./iposStore";

class IposBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const [

      connectionStatus,

      syncMetrics,

    ] = await Promise.all([

      iposService
        .getConnectionStatus(),

      iposService
        .getSyncMetrics(),

    ]);

    const store =
      useIposStore
        .getState();

    store.setConnectionStatus(
      connectionStatus
    );

    store.setSyncMetrics(
      syncMetrics
    );

    this.initialized =
      true;

  }

}

const iposBootstrap =
  new IposBootstrap();

export default
  iposBootstrap;