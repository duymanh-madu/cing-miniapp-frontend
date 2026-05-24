import {
  memo,
} from "react";

import {
  useLowMemoryMode,
} from "../shared/hooks/useLowMemoryMode";

function LowMemoryBadge() {

  const lowMemory =
    useLowMemoryMode();

  if (!lowMemory) {

    return null;

  }

  return (

    <div
      className="

        inline-flex
        items-center

        rounded-full

        bg-yellow-100

        px-3
        py-1

        text-xs
        text-yellow-700

      "
    >

      Low memory mode

    </div>

  );

}

export default memo(
  LowMemoryBadge
);