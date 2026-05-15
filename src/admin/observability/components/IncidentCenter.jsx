function IncidentCenter({
  incidents = [],
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
        Incident Center
      </div>

      <div
        className="
          space-y-4
        "
      >

        {

          incidents.map(
            (
              incident,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  p-4
                "
              >

                <div
                  className="
                    text-lg
                    font-bold
                  "
                >
                  {incident.title}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {incident.description}
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
  IncidentCenter;