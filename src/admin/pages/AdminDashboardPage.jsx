import {
  FaBell,
  FaBolt,
  FaChartLine,
  FaUsers,
} from "react-icons/fa6";

/**
 * ============================================
 * METRICS
 * ============================================
 */

const metrics = [
  {
    label:
      "Realtime Users",

    value: "1,284",

    icon:
      FaUsers,
  },

  {
    label:
      "Socket Events",

    value: "42K",

    icon:
      FaBolt,
  },

  {
    label:
      "Notifications",

    value: "8,291",

    icon:
      FaBell,
  },

  {
    label:
      "Revenue Today",

    value: "24.8M",

    icon:
      FaChartLine,
  },
];

/**
 * ============================================
 * ADMIN DASHBOARD
 * ============================================
 */

function AdminDashboardPage() {
  return (
    <div
      className="
        space-y-6
      "
    >
      {/* HERO */}

      <section
        className="
          rounded-[32px]
          border
          border-white/10
          bg-gradient-to-br
          from-brand-orange
          to-orange-400
          p-8
          text-white
          shadow-[0_30px_80px_rgba(242,140,40,0.25)]
        "
      >
        <p
          className="
            text-sm
            font-bold
            uppercase
            tracking-[0.18em]
            text-white/80
          "
        >
          Realtime Platform
        </p>

        <h1
          className="
            mt-4
            text-[42px]
            font-black
            leading-tight
          "
        >
          Operations Dashboard
        </h1>

        <p
          className="
            mt-4
            max-w-[620px]
            text-white/80
            leading-relaxed
          "
        >
          Live monitoring hệ thống mini app,
          websocket, analytics, campaign,
          voucher và realtime business events.
        </p>
      </section>

      {/* METRICS */}

      <section
        className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {metrics.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.label
                }
                className="
                  rounded-[28px]
                  border
                  border-white/10
                  bg-[#111827]
                  p-6
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      h-[58px]
                      w-[58px]
                      rounded-2xl
                      bg-brand-orange/20
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

                  <div
                    className="
                      h-3
                      w-3
                      rounded-full
                      bg-green-500
                    "
                  />
                </div>

                <p
                  className="
                    mt-6
                    text-sm
                    text-gray-400
                  "
                >
                  {item.label}
                </p>

                <h3
                  className="
                    mt-2
                    text-[34px]
                    font-black
                  "
                >
                  {item.value}
                </h3>
              </div>
            );
          }
        )}
      </section>
    </div>
  );
}

export default AdminDashboardPage;