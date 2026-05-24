function IposRealtimeFeed({
  events = [],
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
        Realtime iPOS Sync
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
                  {event.timestamp}
                </div>

                <div
                  className="
                    mt-2
                    text-lg
                    font-bold
                  "
                >
                  {event.type}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {event.message}
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
  IposRealtimeFeed;