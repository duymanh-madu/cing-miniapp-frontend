import {
  memo,
} from "react";

function RealtimeAnalyticsBadge() {

  return (

    <div
      className="

        inline-flex
        items-center

        rounded-full

        bg-neutral-100

        px-3
        py-1

        text-xs
        text-neutral-500

      "
    >

      Analytics Active

    </div>

  );

}

export default memo(
  RealtimeAnalyticsBadge
);