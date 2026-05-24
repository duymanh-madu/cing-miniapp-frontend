import {
  memo,
} from "react";

import {
  NavLink,
} from "react-router-dom";

function BottomNavigation() {

  const items = [

    {
      to: "/",
      label: "Home",
    },

    {
      to: "/menu",
      label: "Menu",
    },

    {
      to: "/game",
      label: "Game",
    },

    {
      to: "/voucher",
      label: "Voucher",
    },

  ];

  return (

    <nav
      className="

        fixed
        bottom-0
        left-0
        right-0

        z-50

        border-t
        border-neutral-200

        bg-white/95

        backdrop-blur-sm

      "
    >

      <div
        className="

          grid
          grid-cols-4

        "
      >

        {

          items.map(
            (item) => (

              <NavLink
                key={item.to}
                to={item.to}
                className={({

                  isActive,

                }) => `

                  flex
                  flex-col

                  items-center
                  justify-center

                  gap-1

                  py-3

                  text-xs

                  ${

                    isActive

                      ? "text-black font-semibold"

                      : "text-neutral-400"

                  }

                `}
              >

                {item.label}

              </NavLink>

            )
          )

        }

      </div>

    </nav>

  );

}

export default memo(
  BottomNavigation
);