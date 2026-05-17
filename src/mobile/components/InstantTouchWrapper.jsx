import {
  memo,
} from "react";

function InstantTouchWrapper({

  children,

  onClick,

}) {

  return (

    <button
      onClick={onClick}
      className="touch-manipulation"
    >

      {children}

    </button>

  );

}

export default memo(
  InstantTouchWrapper
);