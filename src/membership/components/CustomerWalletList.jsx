import {
  memo,
} from "react";

import {
  useMembershipStore,
} from "../store/membershipStore";

function CustomerWalletList() {

  const walletItems =
    useMembershipStore(
      (state) =>
        state.walletItems
    );

  return (

    <div
      className="

        rounded-3xl

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

        Wallet

      </h3>

      <div
        className="space-y-3"
      >

        {

          walletItems.map(
            (item) => (

              <div
                key={item.id}
                className="

                  rounded-2xl

                  border
                  border-neutral-100

                  p-3

                "
              >

                <p
                  className="

                    text-sm
                    font-medium

                  "
                >

                  {item.title}

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
  CustomerWalletList
);