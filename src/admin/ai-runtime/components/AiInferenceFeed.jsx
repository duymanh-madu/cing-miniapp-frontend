function AiInferenceFeed({
  events = [],
}) {

  return (

    <div
      className="
        rounded-3xl
        bg-black
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
        AI Inference Runtime
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          events.map(
            (
              event,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  bg-zinc-900
                  p-4
                "
              >

                <div
                  className="
                    text-sm
                    text-white/40
                  "
                >
                  {event.timestamp}
                </div>

                <div
                  className="
                    mt-2
                    text-lg
                    font-bold
                  "
                >
                  {event.model}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {event.result}
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
  AiInferenceFeed;