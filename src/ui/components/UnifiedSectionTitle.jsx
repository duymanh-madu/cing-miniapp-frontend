import {
  memo,
} from "react";

function UnifiedSectionTitle({

  title,

  subtitle,

}) {

  return (

    <div
      className="mb-4"
    >

      <h2
        className="

          text-lg
          font-bold

        "
      >

        {title}

      </h2>

      {

        subtitle && (

          <p
            className="

              mt-1

              text-sm
              text-neutral-500

            "
          >

            {subtitle}

          </p>

        )

      }

    </div>

  );

}

export default memo(
  UnifiedSectionTitle
);