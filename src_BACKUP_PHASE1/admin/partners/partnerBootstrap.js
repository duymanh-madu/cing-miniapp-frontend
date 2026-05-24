import partnerService from "./partnerService";

import usePartnerStore from "./partnerStore";

class PartnerBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const [

      partners,

      partnerMetrics,

    ] = await Promise.all([

      partnerService
        .getPartners(),

      partnerService
        .getPartnerMetrics(),

    ]);

    const store =
      usePartnerStore
        .getState();

    store.setPartners(
      partners
    );

    store.setPartnerMetrics(
      partnerMetrics
    );

    this.initialized =
      true;

  }

}

const partnerBootstrap =
  new PartnerBootstrap();

export default
  partnerBootstrap;