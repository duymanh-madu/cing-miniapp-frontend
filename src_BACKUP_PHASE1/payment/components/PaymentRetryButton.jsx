import {
  memo,
} from "react";

import {
  usePaymentStore,
} from "../store/paymentStore";

import {
  recoverPayment,
} from "../services/paymentRecoveryService";

function PaymentRetryButton({
  onRetry,
}) {

  const transactionId =
    usePaymentStore(
      (state) =>
        state.transactionId
    );

  const recoveryPending =
    usePaymentStore(
      (state) =>
        state.recoveryPending
    );

  const incrementRetry =
    usePaymentStore(
      (state) =>
        state.incrementRetry
    );

  async function handleRetry() {

    if (
      recoveryPending
    ) {
      return;
    }

    incrementRetry();

    if (
      onRetry
    ) {

      await onRetry();

      return;

    }

    if (
      transactionId
    ) {

      await recoverPayment({
        transactionId,
      });

    }

  }

  return (

    <button
      onClick={handleRetry}
      disabled={recoveryPending}
      className="
        rounded-2xl
        bg-black
        text-white
        px-5
        py-3
        text-sm
        font-medium
        disabled:opacity-50
      "
    >

      {
        recoveryPending
          ? "Đang kiểm tra..."
          : "Kiểm tra lại thanh toán"
      }

    </button>

  );

}

export default memo(
  PaymentRetryButton
);
