import {
  memo,
} from "react";

function UnifiedStatusChip({

  label,

}) {

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
        font-medium

      "
    >

      {label}

    </div>

  );

}

export default memo(
  UnifiedStatusChip
);