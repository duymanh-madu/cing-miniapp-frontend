function RealtimeOrderFeed({
  orders = [],
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
        Live Orders
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          orders.map(
            (
              order,
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
                    #{order.code}
                  </div>

                  <div
                    className="
                      text-sm
                      text-white/60
                    "
                  >
                    {order.status}
                  </div>

                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/40
                  "
                >
                  {order.customerName}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {order.totalAmount}
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
  RealtimeOrderFeed;