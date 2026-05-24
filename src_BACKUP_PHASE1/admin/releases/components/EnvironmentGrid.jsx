function EnvironmentGrid({
  environmentStatus = {},
}) {

  return (

    <div
      className="
        grid
        grid-cols-1
        gap-4
        md:grid-cols-3
      "
    >

      {

        Object.entries(
          environmentStatus
        ).map(
          (
            [
              key,
              value,
            ]
          ) => (

            <div
              key={key}
              className="
                rounded-3xl
                bg-white/5
                p-5
              "
            >

              <div
                className="
                  text-sm
                  text-white/60
                "
              >
                {key}
              </div>

              <div
                className="
                  mt-3
                  text-2xl
                  font-black
                "
              >
                {value.status}
              </div>

              <div
                className="
                  mt-2
                  text-xs
                  text-white/40
                "
              >
                Version:
                {" "}
                {value.version}
              </div>

            </div>

          )
        )

      }

    </div>

  );

}

export default
  EnvironmentGrid;