import useAnalyticsStore from "@/admin/analytics/analyticsStore";

function RealtimeFeedWidget() {

  const realtimeFeed =
    useAnalyticsStore(
      (
        state
      ) => state.realtimeFeed
    );

  return (

    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
      "
    >

      <div
        className="
          mb-4
          text-lg
          font-bold
        "
      >
        Live Event Feed
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          realtimeFeed.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  bg-black/30
                  p-3
                  text-sm
                "
              >

                {

                  JSON.stringify(
                    item
                  )

                }

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default
  RealtimeFeedWidget;