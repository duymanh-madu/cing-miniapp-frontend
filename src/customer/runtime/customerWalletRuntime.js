import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

class CustomerWalletRuntime {

  updateWallet(
    payload
  ) {

    realtimeCustomerStore
      .getState()
      .setWallet(
        payload
      );

  }

}

const customerWalletRuntime =
  new CustomerWalletRuntime();

export default
  customerWalletRuntime;