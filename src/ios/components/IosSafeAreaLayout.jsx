import {
  memo,
} from "react";

function IosSafeAreaLayout({

  children,

}) {

  return (

    <div
      style={{

        paddingTop:
          "max(12px, var(--safe-top))",

        paddingBottom:
          "max(16px, var(--safe-bottom))",

        minHeight:
          "var(--app-height)",

      }}
    >

      {children}

    </div>

  );

}

export default memo(
  IosSafeAreaLayout
);