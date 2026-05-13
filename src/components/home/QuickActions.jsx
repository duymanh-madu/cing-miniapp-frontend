import {
  useNavigate,
} from "react-router-dom";

import {
  FaGamepad,
  FaGift,
  FaMedal,
  FaMugHot,
} from "react-icons/fa6";

import useQuickActions from "../../hooks/useQuickActions";

/**
 * =========================================================
 * ICON REGISTRY
 * =========================================================
 */

const iconRegistry = {

  game:
    FaGamepad,

  voucher:
    FaGift,

  membership:
    FaMedal,

  menu:
    FaMugHot,

};

/**
 * =========================================================
 * QUICK ACTIONS
 * =========================================================
 */

function QuickActions() {

  const navigate =
    useNavigate();

  const actions =
    useQuickActions();

  /**
   * =======================================================
   * EMPTY STATE
   * =======================================================
   */

  if (
    !actions.length
  ) {

    return null;

  }

  return (

    <section
      className="
        grid
        grid-cols-4
        gap-3
      "
    >

      {actions.map(
        (item) => {

          const Icon =
            iconRegistry[
              item.icon
            ];

          /**
           * =================================================
           * INVALID ICON
           * =================================================
           */

          if (!Icon) {

            return null;

          }

          return (

            <button
              key={
                item.id
              }
              onClick={() =>
                navigate(
                  item.path
                )
              }
              className="
                rounded-[24px]
                bg-white
                p-4
                flex
                flex-col
                items-center
                justify-center
                gap-3
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                border
                border-white/70
                transition-all
                duration-300
                active:scale-95
              "
            >

              <div
                className="
                  h-[52px]
                  w-[52px]
                  rounded-2xl
                  bg-brand-orange/10
                  flex
                  items-center
                  justify-center
                  text-brand-orange
                "
              >

                <Icon
                  className="
                    text-xl
                  "
                />

              </div>

              <span
                className="
                  text-[12px]
                  font-semibold
                  text-gray-700
                "
              >

                {item.label}

              </span>

            </button>

          );

        }
      )}

    </section>

  );

}

export default QuickActions;