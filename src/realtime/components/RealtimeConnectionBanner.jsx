import {
  memo,
} from "react";

import {
  useRealtimeConnection,
} from "../shared/hooks/useRealtimeConnection";

function RealtimeConnectionBanner() {

  const {

    connected,

    reconnecting,

  } = useRealtimeConnection();

  if (
    connected &&
    !reconnecting
  ) {

    return null;

  }

  return (

    <div
      className="

        fixed
        top-0
        left-0
        right-0

        z-[9999]

        bg-black
        text-white

        py-2

        text-center
        text-sm

      "
    >

      {

        reconnecting

          ? "Reconnecting..."

          : "Connection lost"

      }

    </div>

  );

}

export default memo(
  RealtimeConnectionBanner
);