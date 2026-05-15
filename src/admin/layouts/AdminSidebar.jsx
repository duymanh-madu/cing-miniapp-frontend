import {
  NavLink,
} from "react-router-dom";

/**
 * =========================================================
 * ADMIN SIDEBAR NAVIGATION
 * =========================================================
 *
 * PRINCIPLES:
 *
 * - scalable admin navigation
 * - dynamic operating platform
 * - realtime operations ready
 * - campaign operating system
 * - analytics/control center
 * - cms/runtime architecture
 *
 * =========================================================
 */

const items = [

  {
  label:
    "Ecosystem",

  path:
    "/admin/ecosystem",
},

  {
  label:
    "AI Autonomous",

  path:
    "/admin/ai-autonomous",
},

{
  label:
    "AI Runtime",

  path:
    "/admin/ai-runtime",
},

  {
  label:
    "Franchise",

  path:
    "/admin/franchise",
},

{
  label:
    "Tenants",

  path:
    "/admin/tenants",
},

{
  label:
    "Observability",

  path:
    "/admin/observability",
},

{
  label:
    "Releases",

  path:
    "/admin/releases",
},

{
  label:
    "Page Builder",

  path:
    "/admin/builder",
},

{
  label:
    "Schema Designer",

  path:
    "/admin/schema",
},

  {
  label:
    "Orders",
  path:
    "/admin/orders",
},

{
  label:
    "iPOS Runtime",
  path:
    "/admin/ipos",
},

  {
  label:
    "Channels",
  path:
    "/admin/channels",
},

{
  label:
    "Customer 360",
  path:
    "/admin/customer360",
},

{
  label:
    "Audience Engine",
  path:
    "/admin/audiences",
},
  /**
   * =========================================
   * DASHBOARD
   * =========================================
   */

  {
    label:
      "Dashboard",

    path:
      "/admin",
  },

  /**
   * =========================================
   * CAMPAIGNS
   * =========================================
   */

  {
    label:
      "Campaigns",

    path:
      "/admin/campaigns",
  },

  {
    label:
      "Campaign Scheduler",

    path:
      "/admin/campaign-scheduler",
  },

  /**
   * =========================================
   * CMS
   * =========================================
   */

  {
    label:
      "CMS",

    path:
      "/admin/cms",
  },

  /**
   * =========================================
   * ANALYTICS
   * =========================================
   */

  {
    label:
      "Analytics",

    path:
      "/admin/analytics",
  },

  {
    label:
      "Realtime Monitoring",

    path:
      "/admin/realtime",
  },

  /**
   * =========================================
   * MEMBERS
   * =========================================
   */

  {
    label:
      "Members",

    path:
      "/admin/members",
  },

  /**
   * =========================================
   * VOUCHERS
   * =========================================
   */

  {
    label:
      "Vouchers",

    path:
      "/admin/vouchers",
  },

  /**
   * =========================================
   * LOYALTY
   * =========================================
   */

  {
    label:
      "Loyalty",

    path:
      "/admin/loyalty",
  },

  /**
   * =========================================
   * GAMES
   * =========================================
   */

  {
    label:
      "Games",

    path:
      "/admin/games",
  },

  /**
   * =========================================
   * SETTINGS
   * =========================================
   */

  {
    label:
      "Settings",

    path:
      "/admin/settings",
  },

];

function AdminSidebar() {

  return (

    <aside
      className="
        hidden
        w-72
        shrink-0
        border-r
        border-white/10
        bg-zinc-950
        xl:flex
        xl:flex-col
      "
    >

      {/**
       * =====================================
       * HEADER
       * =====================================
       */}

      <div
        className="
          border-b
          border-white/10
          px-6
          py-6
        "
      >

        <div
          className="
            text-2xl
            font-black
            tracking-tight
          "
        >
          Cing Control
        </div>

        <div
          className="
            mt-2
            text-xs
            text-white/40
          "
        >
          Realtime Commerce Platform
        </div>

      </div>

      {/**
       * =====================================
       * NAVIGATION
       * =====================================
       */}

      <nav
        className="
          flex-1
          space-y-2
          overflow-y-auto
          p-4
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
                  items-center
                  rounded-2xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition-all

                  ${

                    isActive

                      ? `
                        bg-white
                        text-black
                      `

                      : `
                        bg-white/[0.03]
                        text-white/70
                        hover:bg-white/[0.08]
                        hover:text-white
                      `

                  }

                `}
              >

                {item.label}

              </NavLink>

            )
          )

        }

      </nav>

      {/**
       * =====================================
       * FOOTER
       * =====================================
       */}

      <div
        className="
          border-t
          border-white/10
          p-4
        "
      >

        <div
          className="
            rounded-2xl
            bg-white/[0.04]
            p-4
          "
        >

          <div
            className="
              text-xs
              uppercase
              tracking-wider
              text-white/40
            "
          >
            Runtime
          </div>

          <div
            className="
              mt-2
              text-sm
              font-semibold
            "
          >
            Production Mode
          </div>

          <div
            className="
              mt-1
              text-xs
              text-green-400
            "
          >
            Realtime Connected
          </div>

        </div>

      </div>

    </aside>

  );

}

export default
  AdminSidebar;