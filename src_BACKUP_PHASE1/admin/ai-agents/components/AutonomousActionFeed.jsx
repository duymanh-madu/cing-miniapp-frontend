function AutonomousActionFeed({
  actions = [],
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
        Autonomous AI Actions
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          actions.map(
            (
              action,
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
                  {action.timestamp}
                </div>

                <div
                  className="
                    mt-2
                    text-lg
                    font-bold
                  "
                >
                  {action.type}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {action.description}
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
  AutonomousActionFeed;