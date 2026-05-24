import {
  memo,
} from "react";

import {
  useOrderExperienceStore,
} from "../stores/orderExperienceStore";

function OrderHistoryList() {

  const history =
    useOrderExperienceStore(
      (state) =>
        state.orderHistory
    );

  return (

    <div
      className="

        rounded-2xl
        bg-white

        p-4

        shadow-sm

      "
    >

      <h3
        className="

          mb-4

          text-sm
          font-semibold

        "
      >

        Order History

      </h3>

      <div
        className="

          space-y-3

        "
      >

        {

          history.map(
            (order) => (

              <div
                key={order.id}
                className="

                  flex
                  items-center
                  justify-between

                  rounded-xl

                  border
                  border-neutral-100

                  p-3

                "
              >

                <div>

                  <p
                    className="

                      text-sm
                      font-medium

                    "
                  >

                    #{order.code}

                  </p>

                  <p
                    className="

                      mt-1

                      text-xs
                      text-neutral-500

                    "
                  >

                    {order.createdAt}

                  </p>

                </div>

                <div
                  className="

                    text-sm
                    font-medium

                  "
                >

                  {order.total}đ

                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default memo(
  OrderHistoryList
);