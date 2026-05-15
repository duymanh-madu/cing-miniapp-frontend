function EcosystemAppsGrid({
  apps = [],
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

        apps.map(
          (
            app
          ) => (

            <div
              key={
                app.id
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
                {app.name}
              </div>

              <div
                className="
                  mt-2
                  text-sm
                  text-white/60
                "
              >
                {app.category}
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
                {app.status}
              </div>

            </div>

          )
        )

      }

    </div>

  );

}

export default
  EcosystemAppsGrid;