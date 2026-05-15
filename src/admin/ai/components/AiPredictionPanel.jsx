function AiPredictionPanel({
  predictions = [],
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
        AI Predictions
      </div>

      <div
        className="
          space-y-4
        "
      >

        {

          predictions.map(
            (
              prediction,
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
                  {prediction.label}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  Confidence:
                  {" "}
                  {prediction.confidence}%
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
  AiPredictionPanel;