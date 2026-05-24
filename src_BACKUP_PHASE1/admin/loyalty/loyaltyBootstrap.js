import loyaltyService from "./loyaltyService";

import useLoyaltyStore from "./loyaltyStore";

class LoyaltyBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useLoyaltyStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        rewards,

        pointRules,

      ] = await Promise.all([

        loyaltyService
          .getRewards(),

        loyaltyService
          .getPointRules(),

      ]);

      store.setRewards(
        rewards
      );

      store.setPointRules(
        pointRules
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

const loyaltyBootstrap =
  new LoyaltyBootstrap();

export default
  loyaltyBootstrap;