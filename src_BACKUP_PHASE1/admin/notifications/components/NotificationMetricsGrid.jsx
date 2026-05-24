function NotificationMetricsGrid({
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
          Sent Today
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.sentToday}
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
          Delivery Rate
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.deliveryRate}%
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
          Open Rate
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.openRate}%
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
          Failed Deliveries
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.failedDeliveries}
        </div>
      </div>

    </div>

  );

}

export default
  NotificationMetricsGrid;