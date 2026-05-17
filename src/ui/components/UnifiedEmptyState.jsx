import {
  memo,
} from "react";

function UnifiedEmptyState({

  title,

  description,

}) {

  return (

    <div
      className="

        rounded-3xl

        bg-white

        p-8

        text-center

        shadow-sm

      "
    >

      <h3
        className="

          text-base
          font-semibold

        "
      >

        {title}

      </h3>

      <p
        className="

          mt-2

          text-sm
          text-neutral-500

        "
      >

        {description}

      </p>

    </div>

  );

}

export default memo(
  UnifiedEmptyState
);