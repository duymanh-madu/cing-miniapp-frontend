function RealtimeDeliveryFeed({
  deliveries = [],
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
        Delivery Feed
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          deliveries.map(
            (
              delivery,
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
                  {delivery.timestamp}
                </div>

                <div
                  className="
                    mt-2
                    text-lg
                    font-bold
                  "
                >
                  {delivery.channel}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {delivery.status}
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
  RealtimeDeliveryFeed;