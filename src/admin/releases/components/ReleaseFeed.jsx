function ReleaseFeed({
  releases = [],
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
        Release Timeline
      </div>

      <div
        className="
          space-y-4
        "
      >

        {

          releases.map(
            (
              release,
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
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      text-lg
                      font-bold
                    "
                  >
                    {release.version}
                  </div>

                  <div
                    className="
                      text-xs
                      text-white/40
                    "
                  >
                    {release.environment}
                  </div>

                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {release.description}
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
  ReleaseFeed;