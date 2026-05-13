import {
  NavLink,
} from "react-router-dom";

import {
  FaGift,
  FaHouse,
  FaMedal,
  FaMugHot,
  FaGamepad,
} from "react-icons/fa6";

import useSystemNavigation
  from "../../hooks/useSystemNavigation";

/**
 * =========================================================
 * ICON REGISTRY
 * =========================================================
 */

const iconRegistry = {

  home:
    FaHouse,

  menu:
    FaMugHot,

  game:
    FaGamepad,

  voucher:
    FaGift,

  membership:
    FaMedal,

};

/**
 * =========================================================
 * FALLBACK ICON
 * =========================================================
 */

const FallbackIcon =
  FaHouse;

/**
 * =========================================================
 * NAV ITEM CLASS
 * =========================================================
 */

function buildNavItemClass(
  isActive
) {

  return `

    flex
    flex-col
    items-center
    gap-2
    rounded-2xl
    px-4
    py-2
    transition-all
    duration-300

    ${
      isActive

        ? `
          bg-brand-orange
          text-white
          shadow-[0_12px_30px_rgba(242,140,40,0.35)]
        `

        : `
          text-gray-400
          active:scale-95
        `
    }

  `;

}

/**
 * =========================================================
 * BOTTOM NAVIGATION
 * =========================================================
 */

function BottomNavigation() {

  const navigation =
    useSystemNavigation();

  /**
   * =======================================================
   * EMPTY NAVIGATION
   * =======================================================
   */

  if (
    !Array.isArray(
      navigation
    ) ||

    !navigation.length
  ) {

    return null;

  }

  return (

    <nav

      aria-label=
        "Bottom Navigation"

      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-white/30
        bg-white/80
        backdrop-blur-2xl
      "
    >

      <div
        className="
          mx-auto
          flex
          max-w-[520px]
          items-center
          justify-around
          px-3
          pb-[max(env(safe-area-inset-bottom),16px)]
          pt-3
        "
      >

        {navigation.map(
          (item) => {

            /**
             * =============================================
             * INVALID ITEM
             * =============================================
             */

            if (

              !item ||

              typeof item !==
                "object"

            ) {

              return null;

            }

            /**
             * =============================================
             * ICON
             * =============================================
             */

            const Icon =

              iconRegistry[
                item.icon
              ] ||

              FallbackIcon;

            return (

              <NavLink

                key={
                  item.id
                }

                to={
                  item.path
                }

                aria-label={
                  item.label
                }

                className={({
                  isActive,
                }) =>

                  buildNavItemClass(
                    isActive
                  )

                }

              >

                <div
                  className="
                    relative
                  "
                >

                  <Icon
                    className="
                      text-lg
                    "
                  />

                  {
                    item.badge >

                    0 && (

                      <span
                        className="
                          absolute
                          -right-2
                          -top-2
                          flex
                          h-4
                          min-w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-red-500
                          px-1
                          text-[10px]
                          font-bold
                          text-white
                        "
                      >

                        {
                          item.badge
                        }

                      </span>

                    )
                  }

                </div>

                <span
                  className="
                    text-[11px]
                    font-bold
                  "
                >

                  {item.label}

                </span>

              </NavLink>

            );

          }
        )}

      </div>

    </nav>

  );

}

export default
  BottomNavigation;