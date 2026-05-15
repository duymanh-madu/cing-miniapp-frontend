import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

class CustomerLoyaltyRuntime {

  addPoints(
    amount
  ) {

    const state =
      realtimeCustomerStore
        .getState();

    const nextPoints =
      state.points +
      amount;

    state.setPoints(
      nextPoints
    );

  }

  removePoints(
    amount
  ) {

    const state =
      realtimeCustomerStore
        .getState();

    const nextPoints =
      Math.max(
        0,
        state.points - amount
      );

    state.setPoints(
      nextPoints
    );

  }

}

const customerLoyaltyRuntime =
  new CustomerLoyaltyRuntime();

export default
  customerLoyaltyRuntime;