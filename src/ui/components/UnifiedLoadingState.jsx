import {
  memo,
} from "react";

function UnifiedLoadingState({

  label = "Loading",

}) {

  return (

    <div
      className="

        flex
        flex-col

        items-center
        justify-center

        gap-3

        py-10

      "
    >

      <div
        className="

          h-8
          w-8

          animate-spin

          rounded-full

          border-2
          border-neutral-300

          border-t-black

        "
      />

      <p
        className="

          text-sm
          text-neutral-500

        "
      >

        {label}

      </p>

    </div>

  );

}

export default memo(
  UnifiedLoadingState
);