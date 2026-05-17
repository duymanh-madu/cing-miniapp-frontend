import {
  memo,
} from "react";

function InteractiveSurface({

  children,

  onClick,

}) {

  return (

    <div
      onClick={onClick}
      className="

        transition-transform
        duration-150

        active:scale-[0.985]

      "
    >

      {children}

    </div>

  );

}

export default memo(
  InteractiveSurface
);