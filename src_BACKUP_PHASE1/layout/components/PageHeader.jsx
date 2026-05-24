import {
  memo,
} from "react";

function PageHeader({

  title,

  subtitle,

  rightContent,

}) {

  return (

    <header
      className="

        sticky
        top-0

        z-30

        border-b
        border-neutral-100

        bg-white/90

        backdrop-blur-sm

      "
    >

      <div
        className="

          flex
          items-center
          justify-between

          px-4
          py-3

        "
      >

        <div>

          <h1
            className="

              text-lg
              font-bold

            "
          >

            {title}

          </h1>

          {

            subtitle && (

              <p
                className="

                  text-xs
                  text-neutral-500

                "
              >

                {subtitle}

              </p>

            )

          }

        </div>

        {rightContent}

      </div>

    </header>

  );

}

export default memo(
  PageHeader
);