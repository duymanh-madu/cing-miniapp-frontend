import {
  memo,
} from "react";

function PaymentRecoveryBanner() {

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

        Payment verification may take a moment.

      </p>

    </div>

  );

}

export default memo(
  PaymentRecoveryBanner
);