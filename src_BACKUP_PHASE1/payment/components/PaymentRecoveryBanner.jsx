import {
  memo,
} from "react";

import {
  usePaymentStore,
} from "../store/paymentStore";

function PaymentRecoveryBanner() {

  const recoveryPending =
    usePaymentStore(
      (state) =>
        state.recoveryPending
    );

  const paymentError =
    usePaymentStore(
      (state) =>
        state.paymentError
    );

  if (
    !recoveryPending &&
    !paymentError
  ) {
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

        {
          recoveryPending
            ? "Đang kiểm tra trạng thái thanh toán..."
            : paymentError ||
              "Thanh toán cần được kiểm tra lại."
        }

      </p>

    </div>

  );

}

export default memo(
  PaymentRecoveryBanner
);
