function AiAgentGrid({
  agents = [],
}) {

  return (

    <div
      className="
        grid
        grid-cols-1
        gap-4
        xl:grid-cols-3
      "
    >

      {

        agents.map(
          (
            agent
          ) => (

            <div
              key={
                agent.id
              }

              className="
                rounded-3xl
                bg-white/5
                p-5
              "
            >

              <div
                className="
                  text-xl
                  font-black
                "
              >
                {agent.name}
              </div>

              <div
                className="
                  mt-2
                  text-sm
                  text-white/60
                "
              >
                {agent.role}
              </div>

              <div
                className="
                  mt-4
                  text-xs
                  text-white/40
                "
              >
                Status:
                {" "}
                {agent.status}
              </div>

            </div>

          )
        )

      }

    </div>

  );

}

export default
  AiAgentGrid;