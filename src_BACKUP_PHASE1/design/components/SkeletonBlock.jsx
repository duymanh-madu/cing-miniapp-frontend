import {
  memo,
} from "react";

function SkeletonBlock({

  className = "",

}) {

  return (

    <div
      className={`

        animate-pulse

        rounded-xl

        bg-neutral-200

        ${className}

      `}
    />

  );

}

export default memo(
  SkeletonBlock
);