import useEventFeedStore from "../eventFeedStore";

function EventFeedPanel() {

  const events =
    useEventFeedStore(
      (
        state
      ) => state.events
    );

  return (

    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
      "
    >

      <div
        className="
          mb-4
          text-lg
          font-bold
        "
      >
        Event Stream
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          events.map(
            (
              event,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  bg-black/30
                  p-3
                  text-xs
                "
              >

                <pre
                  className="
                    overflow-auto
                  "
                >

                  {

                    JSON.stringify(
                      event,
                      null,
                      2
                    )

                  }

                </pre>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default
  EventFeedPanel;