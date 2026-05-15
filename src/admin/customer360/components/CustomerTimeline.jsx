function CustomerTimeline({
  timeline = [],
}) {

  return (

    <div
      className="
        space-y-4
      "
    >

      {

        timeline.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="
                rounded-3xl
                bg-white/5
                p-5
              "
            >

              <div
                className="
                  text-sm
                  text-white/40
                "
              >
                {item.timestamp}
              </div>

              <div
                className="
                  mt-2
                  text-lg
                  font-bold
                "
              >
                {item.event}
              </div>

              <div
                className="
                  mt-2
                  text-sm
                  text-white/60
                "
              >
                {item.description}
              </div>

            </div>

          )
        )

      }

    </div>

  );

}

export default
  CustomerTimeline;