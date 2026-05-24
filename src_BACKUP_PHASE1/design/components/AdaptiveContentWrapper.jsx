import {
  memo,
} from "react";

function AdaptiveContentWrapper({

  children,

}) {

  return (

    <div
      className="

        mx-auto

        w-full
        max-w-5xl

      "
    >

      {children}

    </div>

  );

}

export default memo(
  AdaptiveContentWrapper
);