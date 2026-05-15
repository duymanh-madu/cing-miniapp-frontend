function TenantGrid({
  tenants = [],
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

        tenants.map(
          (
            tenant
          ) => (

            <div
              key={
                tenant.id
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
                {tenant.name}
              </div>

              <div
                className="
                  mt-2
                  text-sm
                  text-white/60
                "
              >
                {tenant.region}
              </div>

              <div
                className="
                  mt-4
                  text-xs
                  text-white/40
                "
              >
                Environment:
                {" "}
                {tenant.environment}
              </div>

            </div>

          )
        )

      }

    </div>

  );

}

export default
  TenantGrid;