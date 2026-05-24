import realtimeCustomerStore from "@/stores/customer";

class CustomerTierRuntime {

  calculateTier(
    spending
  ) {

    if (
      spending >= 10000000
    ) {

      return "Diamond";

    }

    if (
      spending >= 5000000
    ) {

      return "Gold";

    }

    if (
      spending >= 2000000
    ) {

      return "Silver";

    }

    return "Member";

  }

  syncTier() {

    const state =
      realtimeCustomerStore
        .getState();

    const tier =
      this.calculateTier(
        state.spending
      );

    state.setTier(
      tier
    );

  }

}

const customerTierRuntime =
  new CustomerTierRuntime();

export default
  customerTierRuntime;