import {
  Outlet,
  NavLink,
} from "react-router-dom";

import {
  FaChartLine,
  FaGaugeHigh,
  FaGift,
  FaLayerGroup,
  FaUsers,
  FaBell,
} from "react-icons/fa6";

import RealtimeConnectionBadge from "../../components/system/RealtimeConnectionBadge";

/**
 * ============================================
 * NAVIGATION
 * ============================================
 */

const navigation = [
  {
    label:
      "Dashboard",

    path:
      "/admin",

    icon:
      FaGaugeHigh,
  },

  {
    label:
      "Analytics",

    path:
      "/admin/analytics",

    icon:
      FaChartLine,
  },

  {
    label:
      "Users",

    path:
      "/admin/users",

    icon:
      FaUsers,
  },

  {
    label:
      "Campaigns",

    path:
      "/admin/campaigns",

    icon:
      FaLayerGroup,
  },

  {
    label:
      "Vouchers",

    path:
      "/admin/vouchers",

    icon:
      FaGift,
  },

  {
    label:
      "Notifications",

    path:
      "/admin/notifications",

    icon:
      FaBell,
  },
];

/**
 * ============================================
 * ADMIN LAYOUT
 * ============================================
 */

function AdminLayout() {
  return (
    <div
      className="
        min-h-screen
        bg-[#0f172a]
        text-white
      "
    >
      <div
        className="
          flex
          min-h-screen
        "
      >
        {/* SIDEBAR */}

        <aside
          className="
            hidden
            w-[280px]
            border-r
            border-white/10
            bg-[#111827]
            lg:flex
            lg:flex-col
          "
        >
          {/* LOGO */}

          <div
            className="
              border-b
              border-white/10
              px-6
              py-6
            "
          >
            <h1
              className="
                text-[24px]
                font-black
                tracking-tight
              "
            >
              Cing Admin
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-gray-400
              "
            >
              Realtime Operations Center
            </p>

            <div
              className="
                mt-4
              "
            >
              <RealtimeConnectionBadge />
            </div>
          </div>

          {/* NAVIGATION */}

          <nav
            className="
              flex-1
              space-y-2
              p-4
            "
          >
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={
                      item.path
                    }
                    to={
                      item.path
                    }
                    end
                    className={({
                      isActive,
                    }) =>
                      `
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        px-4
                        py-4
                        text-sm
                        font-bold
                        transition-all

                        ${
                          isActive
                            ? `
                              bg-brand-orange
                              text-white
                              shadow-[0_20px_40px_rgba(242,140,40,0.25)]
                            `
                            : `
                              text-gray-400
                              hover:bg-white/5
                              hover:text-white
                            `
                        }
                      `
                    }
                  >
                    <Icon
                      className="
                        text-lg
                      "
                    />

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </NavLink>
                );
              }
            )}
          </nav>
        </aside>

        {/* CONTENT */}

        <div
          className="
            flex-1
          "
        >
          {/* HEADER */}

          <header
            className="
              sticky
              top-0
              z-40
              border-b
              border-white/10
              bg-[#0f172a]/90
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-5
              "
            >
              <div>
                <h2
                  className="
                    text-[28px]
                    font-black
                    tracking-tight
                  "
                >
                  Operations Center
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-400
                  "
                >
                  Realtime business orchestration
                </p>
              </div>

              <RealtimeConnectionBadge />
            </div>
          </header>

          {/* PAGE */}

          <main
            className="
              p-6
            "
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;