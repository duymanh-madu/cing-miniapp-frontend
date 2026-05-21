import useRealtimeCustomerStore
  from "@/stores/realtimeCustomerStore";

/**
 * =====================================================
 * CUSTOMER IDENTITY RUNTIME
 * =====================================================
 */

class CustomerIdentityRuntime {

  initialize() {

    try {

      const profile = {

        id:
          "customer_001",

        name:
          "Nguyễn Duy Mạnh",

        tier:
          "Bronze",

        points:
          12500,

      };

      useRealtimeCustomerStore
        .getState()
        .setProfile(
          profile
        );

      console.log(
        "customer identity initialized"
      );

    } catch (
      error
    ) {

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