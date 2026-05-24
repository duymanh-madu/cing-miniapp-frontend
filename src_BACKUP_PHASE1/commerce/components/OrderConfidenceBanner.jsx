import {
  memo,
} from "react";

function OrderConfidenceBanner() {

  return (

    <div
      className="

        rounded-2xl

        border
        border-green-100

        bg-green-50

        p-4

      "
    >

      <p
        className="

          text-sm
          font-medium

          text-green-700

        "
      >

        Orders are updated in realtime.

      </p>

    </div>

  );

}

export default memo(
  OrderConfidenceBanner
);