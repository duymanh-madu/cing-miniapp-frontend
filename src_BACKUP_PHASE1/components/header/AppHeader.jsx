import {
  NavLink,
} from "react-router-dom";

import {
  FaGamepad,
  FaGift,
  FaHouse,
  FaMedal,
  FaMugHot,
} from "react-icons/fa6";

/**
 * ============================================
 * NAVIGATION ITEMS
 * ============================================
 */

const items = [
  {
    id: "home",

    label: "Trang chủ",

    icon: FaHouse,

    path: "/",
  },

  {
    id: "menu",

    label: "Menu",

    icon: FaMugHot,

    path: "/menu",
  },

  {
    id: "game",

    label: "Game",

    icon: FaGamepad,

    path: "/game",

    badge: "HOT",
  },

  {
    id: "voucher",

    label: "Voucher",

    icon: FaGift,

    path: "/voucher",

    badge: "12",
  },

  {
    id: "member",

    label: "VIP",

    icon: FaMedal,

    path: "/membership",
  },
];

/**
 * ============================================
 * NAV ITEM
 * ============================================
 */

function NavigationItem({
  item,
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({
        isActive,
      }) =>
        `
          relative
          flex
          flex-1
          flex-col
          items-center
          justify-center
          gap-2
          rounded-[24px]
          py-3
          transition-all
          duration-300

          ${
            isActive
              ? `
                bg-gradient-to-br
                from-[#f28c28]
                to-[#ffad49]
                text-white
                shadow-[0_10px_30px_rgba(242,140,40,0.35)]
              `
              : `
                text-[#7b6a58]
              `
          }
        `
      }
    >
      {({
        isActive,
      }) => (
        <>
          {/* BADGE */}

          {item.badge && (
            <div
              className="
                absolute
                right-3
                top-2
                rounded-full
                bg-[#ff4d4f]
                px-1.5
                py-0.5
                text-[9px]
                font-black
                text-white
              "
            >
              {item.badge}
            </div>
          )}

          {/* ICON */}

          <div
            className={`
              flex
              h-[42px]
              w-[42px]
              items-center
              justify-center
              rounded-[18px]
              transition-all
              duration-300

              ${
                isActive
                  ? `
                    bg-white/20
                    backdrop-blur-xl
                  `
                  : `
                    bg-[#fff4e8]
                  `
              }
            `}
          >
            <Icon className="text-[18px]" />
          </div>

          {/* LABEL */}

          <span
            className="
              text-[10px]
              font-black
              tracking-[0.08em]
            "
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

/**
 * ============================================
 * BOTTOM NAVIGATION
 * ============================================
 */

function BottomNavigation() {
  return (
    <div
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        flex
        justify-center
        px-4
        pb-5
      "
    >
      <nav
        className="
          relative
          flex
          w-full
          max-w-[480px]
          items-center
          gap-2
          rounded-[34px]
          border
          border-white/50
          bg-white/75
          p-3
          shadow-[0_25px_60px_rgba(0,0,0,0.12)]
          backdrop-blur-3xl
        "
      >
        {/* BACKGROUND GLOW */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-[34px]
            bg-[radial-gradient(circle_at_top,rgba(255,180,80,0.14),transparent_60%)]
          "
        />

        {/* ITEMS */}

        {items.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
          />
        ))}
      </nav>
    </div>
  );
}

export default BottomNavigation;