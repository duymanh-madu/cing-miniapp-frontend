import {
  memo,
} from "react";

function RealtimeBadge({

  active = true,

}) {

  return (

    <div
      className="

        inline-flex
        items-center

        gap-2

        rounded-full

        bg-blue-50

        px-3
        py-1

        text-xs
        font-medium

        text-blue-700

      "
    >

      <div
        className={`

          h-2
          w-2

          rounded-full

          ${

            active

              ? "bg-green-500"

              : "bg-neutral-400"

          }

        `}
      />

      Live

    </div>

  );

}

export default memo(
  RealtimeBadge
);