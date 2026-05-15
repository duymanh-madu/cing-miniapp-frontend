import audienceService from "./audienceService";

import useAudienceStore from "./audienceStore";

class AudienceBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const audiences =
      await audienceService
        .getAudiences();

    useAudienceStore
      .getState()
      .setAudiences(
        audiences
      );

    this.initialized =
      true;

  }

}

const audienceBootstrap =
  new AudienceBootstrap();

export default
  audienceBootstrap;