function RealtimeLogsFeed({
  logs = [],
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
        Realtime Logs
      </div>

      <div
        className="
          max-h-[700px]
          overflow-auto
          space-y-3
        "
      >

        {

          logs.map(
            (
              log,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  bg-zinc-900
                  p-4
                  text-sm
                "
              >

                <div
                  className="
                    text-white/40
                  "
                >
                  {log.timestamp}
                </div>

                <div
                  className="
                    mt-2
                    font-bold
                  "
                >
                  {log.level}
                </div>

                <div
                  className="
                    mt-2
                    text-white/70
                  "
                >
                  {log.message}
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
  RealtimeLogsFeed;