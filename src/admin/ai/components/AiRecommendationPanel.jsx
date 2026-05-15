function AiRecommendationPanel({
  recommendations = [],
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
        AI Recommendations
      </div>

      <div
        className="
          space-y-4
        "
      >

        {

          recommendations.map(
            (
              item,
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
                    text-lg
                    font-bold
                  "
                >
                  {item.title}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {item.description}
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
  AiRecommendationPanel;