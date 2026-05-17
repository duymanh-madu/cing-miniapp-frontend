import {
  memo,
} from "react";

function OperationalListItem({

  title,

  subtitle,

  rightContent,

}) {

  return (

    <div
      className="

        flex
        items-center
        justify-between

        py-3

      "
    >

      <div>

        <h4
          className="

            text-sm
            font-medium

          "
        >

          {title}

        </h4>

        {

          subtitle && (

            <p
              className="

                mt-1

                text-xs
                text-neutral-500

              "
            >

              {subtitle}

            </p>

          )

        }

      </div>

      <div>

        {rightContent}

      </div>

    </div>

  );

}

export default memo(
  OperationalListItem
);