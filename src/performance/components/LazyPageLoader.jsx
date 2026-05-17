import {
  memo,
} from "react";

function LazyPageLoader() {

  return (

    <div
      className="

        flex
        items-center
        justify-center

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

    </div>

  );

}

export default memo(
  LazyPageLoader
);