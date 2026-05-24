import {
  memo,
} from "react";

function IosBottomSafeNavigation({

  children,

}) {

  return (

    <div
      className="

        sticky
        bottom-0

        z-40

        bg-white

      "
      style={{

        paddingBottom:
          "max(10px, var(--safe-bottom))",

      }}
    >

      {children}

    </div>

  );

}

export default memo(
  IosBottomSafeNavigation
);