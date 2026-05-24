import realtimeCustomerStore from "@/stores/customer";

class CustomerRankRuntime {

  syncRank(
    payload
  ) {

    realtimeCustomerStore
      .getState()
      .setRank(
        payload.rank
      );

  }

}

const customerRankRuntime =
  new CustomerRankRuntime();

export default
  customerRankRuntime;