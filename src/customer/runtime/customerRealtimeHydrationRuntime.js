import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

class CustomerRealtimeHydrationRuntime {

  initialize() {

    realtimeCustomerStore
      .subscribe(
        (state) => {

          localStorage.setItem(

            "customer_realtime_state",

            JSON.stringify({

              points:
                state.points,

              tier:
                state.tier,

              rank:
                state.rank,

            })

          );

        }
      );

  }

}

const customerRealtimeHydrationRuntime =
  new CustomerRealtimeHydrationRuntime();

export default
  customerRealtimeHydrationRuntime;