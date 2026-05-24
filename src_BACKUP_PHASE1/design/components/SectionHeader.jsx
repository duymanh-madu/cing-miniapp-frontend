import {
  memo,
} from "react";

function SectionHeader({

  title,

  description,

}) {

  return (

    <div className="mb-4">

      <h2
        className="

          text-lg
          font-bold

          tracking-tight

          text-neutral-900

        "
      >

        {title}

      </h2>

      {

        description && (

          <p
            className="

              mt-1

              text-sm
              text-neutral-500

            "
          >

            {description}

          </p>

        )

      }

    </div>

  );

}

export default memo(
  SectionHeader
);