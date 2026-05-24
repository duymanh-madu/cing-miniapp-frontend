function VoucherMetricsGrid({
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
          Active Vouchers
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.activeVouchers}
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
          Redemption Rate
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.redemptionRate}%
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
          Distributed
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.distributed}
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
          Expired
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.expired}
        </div>

      </div>

    </div>

  );

}

export default
  VoucherMetricsGrid;