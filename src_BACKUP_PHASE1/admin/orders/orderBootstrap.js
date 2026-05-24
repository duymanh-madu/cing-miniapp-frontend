import orderService from "./orderService";

import useOrderStore from "./orderStore";

class OrderBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useOrderStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        realtimeOrders,

        orderMetrics,

      ] = await Promise.all([

        orderService
          .getRealtimeOrders(),

        orderService
          .getOrderMetrics(),

      ]);

      store.setRealtimeOrders(
        realtimeOrders
      );

      store.setOrderMetrics(
        orderMetrics
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

const orderBootstrap =
  new OrderBootstrap();

export default
  orderBootstrap;