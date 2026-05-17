import RealtimeToastRenderer
from "./RealtimeToastRenderer";

import {

  useRealtimeOverlay,

} from "./useRealtimeOverlay";

export default function GlobalRealtimeOverlay() {

  const {

    overlays,

  } = useRealtimeOverlay();

  return (

    <div
      className="

        fixed
        top-4
        left-0
        right-0

        z-[99999]

        flex
        flex-col

        items-center

        gap-3

        pointer-events-none

      "
    >

      {

        overlays.map(
          (toast) => (

            <RealtimeToastRenderer
              key={toast.id}
              toast={toast}
            />

          )
        )

      }

    </div>

  );

}