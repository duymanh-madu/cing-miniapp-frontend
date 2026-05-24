function AutomationMetricsGrid({
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
          Active Workflows
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.activeWorkflows}
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
          Executions Today
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.executionsToday}
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
          Success Rate
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.successRate}%
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
          AI Decisions
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.aiDecisions}
        </div>
      </div>

    </div>

  );

}

export default
  AutomationMetricsGrid;