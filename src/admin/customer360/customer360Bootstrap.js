import customer360Service from "./customer360Service";

import useCustomer360Store from "./customer360Store";

class Customer360Bootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useCustomer360Store
        .getState();

    try {

      store.setLoading(
        true
      );

      const profiles =
        await customer360Service
          .getProfiles();

      store.setProfiles(
        profiles
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

const customer360Bootstrap =
  new Customer360Bootstrap();

export default
  customer360Bootstrap;