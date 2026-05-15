import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

class CustomerSpendingRuntime {

  increase(
    amount
  ) {

    const state =
      realtimeCustomerStore
        .getState();

    state.setSpending(
      state.spending +
      amount
    );

  }

}

const customerSpendingRuntime =
  new CustomerSpendingRuntime();

export default
  customerSpendingRuntime;