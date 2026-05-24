import {
  memo,
} from "react";

function SurfaceCard({

  children,

  className = "",

}) {

  return (

    <div
      className={`

        rounded-2xl
        bg-white

        border
        border-neutral-200

        p-4

        shadow-sm

        ${className}

      `}
    >

      {children}

    </div>

  );

}

export default memo(
  SurfaceCard
);