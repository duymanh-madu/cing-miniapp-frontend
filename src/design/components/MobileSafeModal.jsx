import {
  memo,
} from "react";

function MobileSafeModal({

  open,

  children,

}) {

  if (!open) {

    return null;

  }

  return (

    <div
      className="

        fixed
        inset-0

        z-[9999]

        flex
        items-end

        bg-black/30

        md:items-center
        md:justify-center

      "
    >

      <div
        className="

          w-full

          rounded-t-3xl

          bg-white

          p-4

          md:max-w-md
          md:rounded-3xl

        "
      >

        {children}

      </div>

    </div>

  );

}

export default memo(
  MobileSafeModal
);