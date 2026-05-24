import {
  useEffect,
} from "react";

import {
  runtimeOrchestrator,
} from "@/runtime/orchestrator";

import orderRuntimeModule from "../orderRuntimeModule";


import useOrderStore from "../orderStore";

import OrderMetricsGrid from "../components/OrderMetricsGrid";

import RealtimeOrderFeed from "../components/RealtimeOrderFeed";

function OrdersPage() {

  const {

    orderMetrics,

    realtimeOrders,

  } = useOrderStore();

  useEffect(() => {

    runtimeOrchestrator.register(
      orderRuntimeModule
    );

    runtimeOrchestrator.activate(
      "admin.orders",
      {
        source:
          "OrdersPage",
        route:
          "/admin/orders",
      }
    );

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