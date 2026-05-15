function LoyaltyMetricsGrid({
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
          Active Members
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.activeMembers}
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
          Points Issued
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.pointsIssued}
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
          Rewards Redeemed
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.rewardsRedeemed}
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
          Retention
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.retentionRate}%
        </div>

      </div>

    </div>

  );

}

export default
  LoyaltyMetricsGrid;