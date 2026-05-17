import {
  memo,
} from "react";

import {
  ENVIRONMENT_CONFIG,
} from "../config/environmentConfig";

function EnvironmentBadge() {

  return (

    <div
      className="

        inline-flex
        items-center

        rounded-full

        bg-black
        text-white

        px-3
        py-1

        text-xs

      "
    >

      {

        ENVIRONMENT_CONFIG
          .APP_ENV

      }

    </div>

  );

}

export default memo(
  EnvironmentBadge
);