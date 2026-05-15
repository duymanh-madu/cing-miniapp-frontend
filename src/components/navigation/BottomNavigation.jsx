import {
  NavLink,
} from "react-router-dom";

/**
 * =========================================================
 * NAVIGATION ITEMS
 * =========================================================
 */

const items = [

  {
    label:
      "Trang chủ",

    path:
      "/",
  },

  {
    label:
      "Menu",

    path:
      "/menu",
  },

  {
    label:
      "Game",

    path:
      "/game",
  },

  {
    label:
      "BXH",

    path:
      "/leaderboard",
  },

  {
    label:
      "Tài khoản",

    path:
      "/account",
  },

];

/**
 * =========================================================
 * BOTTOM NAVIGATION
 * =========================================================
 */

function BottomNavigation() {

  return (

    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        flex
        justify-center
        pb-safe
      "
    >

      <div
        className="
          flex
          w-full
          max-w-[520px]
          items-center
          justify-around
          border-t
          border-[#e5e7eb]
          bg-white/95
          px-2
          py-3
          backdrop-blur
        "
      >

        {

          items.map(
            (
              item
            ) => (

              <NavLink
                key={
                  item.path
                }

                to={
                  item.path
                }

                className={(
                  {
                    isActive,
                  }
                ) => `
                  flex
                  min-w-[64px]
                  flex-col
                  items-center
                  gap-1
                  rounded-2xl
                  px-3
                  py-2
                  text-[11px]
                  font-semibold
                  transition-all

                  ${
                    isActive

                      ? `
                        bg-[#fff1e6]
                        text-[#ff7a00]
                      `

                      : `
                        text-[#6b7280]
                      `
                  }
                `}
              >

                <span>
                  {item.label}
                </span>

              </NavLink>

            )
          )

        }

      </div>

    </nav>

  );

}

export default
  BottomNavigation;