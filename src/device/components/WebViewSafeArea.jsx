import {
  memo,
} from "react";

function WebViewSafeArea({

  children,

}) {

  return (

    <div
      style={{
        minHeight:
          "calc(var(--vh, 1vh) * 100)",
      }}
    >

      {children}

    </div>

  );

}

export default memo(
  WebViewSafeArea
);