import {
  memo,
} from "react";

function MobileViewportWrapper({

  children,

}) {

  return (

    <div
      className="

        min-h-screen

        overflow-x-hidden

        bg-[#f5f7fb]

        text-black

      "
    >

      {children}

    </div>

  );

}

export default memo(
  MobileViewportWrapper
);