import {
  memo,
} from "react";

function PaymentRetryButton({

  onRetry,

}) {

  return (

    <button
      onClick={onRetry}
      className="

        rounded-2xl

        bg-black
        text-white

        px-5
        py-3

        text-sm
        font-medium

      "
    >

      Retry Payment

    </button>

  );

}

export default memo(
  PaymentRetryButton
);