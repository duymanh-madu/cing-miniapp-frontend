import {
  Link,
} from "react-router-dom";

import navigationRuntime from "@/cms/runtime/navigationRuntime";

function DynamicBottomNavigation() {

  const items =
    navigationRuntime
      .getNavigation();

  return (

    <div
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-zinc-800
        bg-black
        px-4
        py-3
      "
    >

      <div
        className="
          flex
          items-center
          justify-around
        "
      >

        {
          items.map(
            (
              item
            ) => (

              <Link
                key={
                  item.id
                }
                to={
                  item.path
                }
                className="
                  text-xs
                  text-white
                "
              >

                {
                  item.label
                }

              </Link>

            )
          )
        }

      </div>

    </div>

  );

}

export default
  DynamicBottomNavigation;