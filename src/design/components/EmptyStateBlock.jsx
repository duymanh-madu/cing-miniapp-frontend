import {
  memo,
} from "react";

function EmptyStateBlock({

  title,

  description,

}) {

  return (

    <div
      className="

        rounded-2xl

        border
        border-dashed
        border-neutral-200

        bg-white

        p-8

        text-center

      "
    >

      <h3
        className="

          text-sm
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
  EmptyStateBlock
);