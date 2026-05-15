import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

import customerProfileApi from "@/customer/services/customerProfileApi";

class CustomerIdentityRuntime {

  initialized =
    false;

  async initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    try {

      const profile =
        await customerProfileApi
          .getMyProfile();

      if (
        profile
      ) {

        realtimeCustomerStore
          .getState()
          .setProfile(
            profile
          );

      }

      this.initialized =
        true;

    } catch (error) {

      console.error(
        "customer identity initialize failed",
        error
      );

    }

  }

}

const customerIdentityRuntime =
  new CustomerIdentityRuntime();

export default
  customerIdentityRuntime;