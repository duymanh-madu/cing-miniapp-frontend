import { memo } from "react";

import {
  useCustomerUXStore,
} from "../stores/customerUXStore";

function InstantLoadingOverlay() {

  const loading =
    useCustomerUXStore(
      (state) =>
        state.loading
    );

  if (!loading) {

    return null;

  }

  return (

    <div
      className="

        fixed
        inset-0

        z-[9999]

        flex
        items-center
        justify-center

        bg-black/20
        backdrop-blur-sm

      "
    >

      <div
        className="

          rounded-2xl
          bg-white

          px-5
          py-3

          text-sm
          font-medium

          shadow-xl

        "
      >

        Loading...

      </div>

    </div>

  );

}

export default memo(
  InstantLoadingOverlay
);