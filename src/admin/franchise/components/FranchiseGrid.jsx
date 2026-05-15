function FranchiseGrid({
  franchises = [],
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

        franchises.map(
          (
            franchise
          ) => (

            <div
              key={
                franchise.id
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
                {franchise.name}
              </div>

              <div
                className="
                  mt-2
                  text-sm
                  text-white/60
                "
              >
                {franchise.region}
              </div>

              <div
                className="
                  mt-4
                  text-xs
                  text-white/40
                "
              >
                Branches:
                {" "}
                {franchise.branchCount}
              </div>

            </div>

          )
        )

      }

    </div>

  );

}

export default
  FranchiseGrid;