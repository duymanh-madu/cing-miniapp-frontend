import {
  memo,
} from "react";

import {
  useCommerceUXStore,
} from "../stores/commerceUXStore";

function VoucherWalletCard() {

  const vouchers =
    useCommerceUXStore(
      (state) =>
        state.vouchers
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

        Voucher Wallet

      </h3>

      <div
        className="

          space-y-3

        "
      >

        {

          vouchers.map(
            (voucher) => (

              <div
                key={voucher.id}
                className="

                  rounded-xl

                  border
                  border-neutral-200

                  p-3

                "
              >

                <p
                  className="

                    text-sm
                    font-medium

                  "
                >

                  {voucher.title}

                </p>

                <p
                  className="

                    mt-1

                    text-xs
                    text-neutral-500

                  "
                >

                  {voucher.expiredAt}

                </p>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default memo(
  VoucherWalletCard
);