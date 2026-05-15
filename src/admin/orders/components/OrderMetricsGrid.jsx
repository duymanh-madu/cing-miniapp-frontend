function OrderMetricsGrid({
  metrics,
}) {

  return (

    <div
      className="
        grid
        grid-cols-1
        gap-4
        md:grid-cols-4
      "
    >

      <div
        className="
          rounded-3xl
          bg-white/5
          p-5
        "
      >
        <div
          className="
            text-sm
            text-white/60
          "
        >
          Orders Today
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.ordersToday}
        </div>
      </div>

      <div
        className="
          rounded-3xl
          bg-white/5
          p-5
        "
      >
        <div
          className="
            text-sm
            text-white/60
          "
        >
          Revenue Today
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.revenueToday}
        </div>
      </div>

      <div
        className="
          rounded-3xl
          bg-white/5
          p-5
        "
      >
        <div
          className="
            text-sm
            text-white/60
          "
        >
          Pending Orders
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.pendingOrders}
        </div>
      </div>

      <div
        className="
          rounded-3xl
          bg-white/5
          p-5
        "
      >
        <div
          className="
            text-sm
            text-white/60
          "
        >
          Avg Preparation
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.avgPreparation}m
        </div>
      </div>

    </div>

  );

}

export default
  OrderMetricsGrid;