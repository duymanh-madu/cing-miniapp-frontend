import realtimeCustomerStore from "@/stores/customer";

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