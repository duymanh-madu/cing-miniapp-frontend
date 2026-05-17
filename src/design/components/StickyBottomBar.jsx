import {
  memo,
} from "react";

function StickyBottomBar({

  children,

}) {

  return (

    <div
      className="

        fixed
        bottom-0
        left-0
        right-0

        z-40

        border-t
        border-neutral-200

        bg-white/90

        p-4

        backdrop-blur-sm

      "
    >

      {children}

    </div>

  );

}

export default memo(
  StickyBottomBar
);