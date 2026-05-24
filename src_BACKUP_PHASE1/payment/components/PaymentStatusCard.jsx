import {
  memo,
} from "react";

import {
  usePaymentStore,
} from "../store/paymentStore";

function PaymentStatusCard() {

  const status =
    usePaymentStore(
      (state) =>
        state.paymentStatus
    );

  return (

    <div
      className="

        rounded-3xl

        bg-white

        p-5

        shadow-sm

      "
    >

      <p
        className="

          text-xs
          text-neutral-500

        "
      >

        Payment Status

      </p>

      <h2
        className="

          mt-2

          text-2xl
          font-bold

        "
      >

        {status}

      </h2>

    </div>

  );

}

export default memo(
  PaymentStatusCard
);