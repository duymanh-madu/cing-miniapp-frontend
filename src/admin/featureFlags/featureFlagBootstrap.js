import featureFlagService from "./featureFlagService";

import useFeatureFlagStore from "./featureFlagStore";

class FeatureFlagBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const flags =
      await featureFlagService
        .load();

    useFeatureFlagStore
      .getState()
      .setFlags(
        flags
      );

    this.initialized =
      true;

  }

}

const featureFlagBootstrap =
  new FeatureFlagBootstrap();

export default
  featureFlagBootstrap;