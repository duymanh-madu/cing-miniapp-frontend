import {
  useEffect,
} from "react";

import orderBootstrap from "../orderBootstrap";

import orderRealtimeSocket from "../orderRealtimeSocket";

import useOrderStore from "../orderStore";

import OrderMetricsGrid from "../components/OrderMetricsGrid";

import RealtimeOrderFeed from "../components/RealtimeOrderFeed";

function OrdersPage() {

  const {

    orderMetrics,

    realtimeOrders,

  } = useOrderStore();

  useEffect(() => {

    orderBootstrap
      .bootstrap();

    orderRealtimeSocket
      .initialize();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Commerce Command Center
      </div>

      <OrderMetricsGrid
        metrics={
          orderMetrics
        }
      />

      <RealtimeOrderFeed
        orders={
          realtimeOrders
        }
      />

    </div>

  );

}

export default
  OrdersPage;