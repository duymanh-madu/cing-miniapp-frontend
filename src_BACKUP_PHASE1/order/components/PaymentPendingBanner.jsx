import {
  memo,
} from "react";

import {
  useOrderExperienceStore,
} from "../stores/orderExperienceStore";

function PaymentPendingBanner() {

  const pending =
    useOrderExperienceStore(
      (state) =>
        state.paymentPending
    );

  if (!pending) {

    return null;

  }

  return (

    <div
      className="

        rounded-2xl

        border
        border-yellow-100

        bg-yellow-50

        p-4

      "
    >

      <p
        className="

          text-sm
          font-medium

          text-yellow-700

        "
      >

        Payment is being verified...

      </p>

    </div>

  );

}

export default memo(
  PaymentPendingBanner
);