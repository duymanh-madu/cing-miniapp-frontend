import realtimeCustomerStore from "@/stores/customer";

class CustomerHydrationRuntime {

  STORAGE_KEY =
    "customer_hydration";

  hydrate() {

    try {

      const raw =
        localStorage.getItem(
          this.STORAGE_KEY
        );

      if (!raw) {
        return;
      }

      const data =
        JSON.parse(raw);

      realtimeCustomerStore
        .setState(data);

    } catch (error) {

      console.error(
        "customer hydration failed",
        error
      );

    }

  }

  persist() {

    const state =
      realtimeCustomerStore
        .getState();

    localStorage.setItem(

      this.STORAGE_KEY,

      JSON.stringify({
        profile:
          state.profile,
        points:
          state.points,
        tier:
          state.tier,
        vouchers:
          state.vouchers,
        spending:
          state.spending,
        rank:
          state.rank,
      })

    );

  }

}

const customerHydrationRuntime =
  new CustomerHydrationRuntime();

export default
  customerHydrationRuntime;