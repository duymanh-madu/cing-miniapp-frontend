function AiRuntimeMetricsGrid({
  metrics = {},
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
          Active Models
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.activeModels}
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
          Inference / Min
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.inferencePerMinute}
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
          Avg Latency
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.avgLatency}ms
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
          AI Accuracy
        </div>

        <div
          className="
            mt-3
            text-3xl
            font-black
          "
        >
          {metrics.accuracy}%
        </div>
      </div>

    </div>

  );

}

export default
  AiRuntimeMetricsGrid;