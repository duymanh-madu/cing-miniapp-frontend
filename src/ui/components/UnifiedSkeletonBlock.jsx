import {
  memo,
} from "react";

function UnifiedSkeletonBlock({

  height = 120,

}) {

  return (

    <div
      className="

        animate-pulse

        rounded-3xl

        bg-neutral-200

      "
      style={{
        height,
      }}
    />

  );

}

export default memo(
  UnifiedSkeletonBlock
);