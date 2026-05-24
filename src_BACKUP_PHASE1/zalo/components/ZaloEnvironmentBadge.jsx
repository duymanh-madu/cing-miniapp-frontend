import {
  memo,
} from "react";

function ZaloEnvironmentBadge() {

  const insideZalo =
    Boolean(
      window.zmp
    );

  return (

    <div
      className="

        inline-flex
        items-center

        rounded-full

        bg-neutral-100

        px-3
        py-1

        text-xs

      "
    >

      {

        insideZalo

          ? "Running inside Zalo"

          : "Browser mode"

      }

    </div>

  );

}

export default memo(
  ZaloEnvironmentBadge
);