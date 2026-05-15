import useAnalyticsStore from "../analyticsStore";

function AnalyticsPage() {

  const metrics =
    useAnalyticsStore(
      (
        state
      ) => state.metrics
    );

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
        Analytics Center
      </div>

      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-5
        "
      >

        <pre
          className="
            overflow-auto
            text-sm
          "
        >

          {

            JSON.stringify(
              metrics,
              null,
              2
            )

          }

        </pre>

      </div>

    </div>

  );

}

export default
  AnalyticsPage;