import {
  memo,
} from "react";

function DynamicIslandSafeHeader({

  children,

}) {

  return (

    <header
      className="

        sticky
        top-0

        z-40

        bg-white/95

        backdrop-blur-sm

      "
      style={{

        paddingTop:
          "max(10px, var(--safe-top))",

      }}
    >

      {children}

    </header>

  );

}

export default memo(
  DynamicIslandSafeHeader
);