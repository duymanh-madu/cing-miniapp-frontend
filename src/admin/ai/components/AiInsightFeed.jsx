function AiInsightFeed({
  insights = [],
}) {

  return (

    <div
      className="
        rounded-3xl
        bg-white/5
        p-5
      "
    >

      <div
        className="
          mb-5
          text-2xl
          font-black
        "
      >
        AI Insight Feed
      </div>

      <div
        className="
          space-y-4
        "
      >

        {

          insights.map(
            (
              insight,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  bg-black/40
                  p-4
                "
              >

                <div
                  className="
                    text-sm
                    text-white/40
                  "
                >
                  {insight.type}
                </div>

                <div
                  className="
                    mt-2
                    text-lg
                    font-bold
                  "
                >
                  {insight.title}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {insight.description}
                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default
  AiInsightFeed;