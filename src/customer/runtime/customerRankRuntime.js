import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

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