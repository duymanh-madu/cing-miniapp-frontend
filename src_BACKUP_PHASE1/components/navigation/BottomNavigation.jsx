import {
  memo,
} from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  prefetchRoute,
} from "@/performance/services/routePrefetchService";

const items = [

  {
    label:
      "Trang chủ",
    path:
      "/",
    routeKey:
      "home",
    preload:
      () => import("@/pages/HomePage"),
  },

  {
    label:
      "Menu",
    path:
      "/menu",
    routeKey:
      "menu",
    preload:
      () => import("@/features/menu"),
  },

  {
    label:
      "Game",
    path:
      "/game",
    routeKey:
      "game",
    preload:
      () => import("@/features/game"),
  },

  {
    label:
      "BXH",
    path:
      "/leaderboard",
    routeKey:
      "leaderboard",
    preload:
      () => import("@/features/leaderboard"),
  },

  {
    label:
      "Tài khoản",
    path:
      "/account",
    routeKey:
      "account",
    preload:
      () => import("@/features/account"),
  },

];

function handlePrefetch(
  item
) {

  prefetchRoute(
    item.routeKey,
    item.preload
  );

}

/**
 * =========================================================
 * ZALO WEBVIEW BOTTOM NAVIGATION
 * =========================================================
 * Mobile-first, iOS safe-area, instant prefetch.
 * =========================================================
 */

function BottomNavigation() {

  return (

    <nav
      aria-label="Main navigation"
      className="
        fixed
        left-0
        right-0
        bottom-0
        z-50
        flex
        justify-center
        border-t
        border-black/5
        bg-white/95
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-white/80
      "
      style={{
        height:
          "var(--bottom-nav-safe-height)",

        paddingBottom:
          "var(--app-safe-bottom)",

        paddingLeft:
          "max(8px, var(--safe-left))",

        paddingRight:
          "max(8px, var(--safe-right))",
      }}
    >

      <div
        className="
          grid
          h-[72px]
          w-full
          max-w-[520px]
          grid-cols-5
          items-center
          gap-1
          px-1
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
                onPointerEnter={() =>
                  handlePrefetch(
                    item
                  )
                }
                onTouchStart={() =>
                  handlePrefetch(
                    item
                  )
                }
                className={(
                  {
                    isActive,
                  }
                ) => `
                  flex
                  min-h-[56px]
                  min-w-0
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  px-1
                  text-[11px]
                  font-bold
                  tracking-[-0.01em]
                  transition-transform
                  duration-150
                  active:scale-95
                  ${
                    isActive
                      ? `
                        bg-[#fff1e6]
                        text-[#ff7a00]
                      `
                      : `
                        text-[#737373]
                      `
                  }
                `}
              >

                <span
                  className="
                    truncate
                  "
                >
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

export default memo(
  BottomNavigation
);
