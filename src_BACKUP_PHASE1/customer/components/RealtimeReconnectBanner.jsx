import { memo } from "react";

import {
  useCustomerUXStore,
} from "../stores/customerUXStore";

function RealtimeReconnectBanner() {

  const reconnecting =
    useCustomerUXStore(
      (state) =>
        state.reconnecting
    );

  if (!reconnecting) {

    return null;

  }

  return (

    <div
      className="

        fixed
        top-0
        left-0
        right-0

        z-50

        bg-black
        text-white

        py-2

        text-center
        text-sm

      "
    >

      Reconnecting...

    </div>

  );

}

export default memo(
  RealtimeReconnectBanner
);