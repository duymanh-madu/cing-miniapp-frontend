function WorkflowExecutionFeed({
  executions = [],
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
        Realtime Workflow Feed
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          executions.map(
            (
              execution,
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
                  {execution.timestamp}
                </div>

                <div
                  className="
                    mt-2
                    text-lg
                    font-bold
                  "
                >
                  {execution.workflow}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {execution.status}
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
  WorkflowExecutionFeed;