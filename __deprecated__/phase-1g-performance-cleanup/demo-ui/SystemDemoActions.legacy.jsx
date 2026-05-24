import {
  FaBell,
  FaChartLine,
  FaGamepad,
  FaGift,
  FaRocket,
  FaUsers,
} from "react-icons/fa";

const actions = [
  {
    id: 1,
    title: "Realtime CRM",
    description: "Quản lý khách hàng realtime",
    icon: FaUsers,
  },
  {
    id: 2,
    title: "Campaign Engine",
    description: "Điều phối chiến dịch marketing",
    icon: FaRocket,
  },
  {
    id: 3,
    title: "Notification Hub",
    description: "Điều khiển notification system",
    icon: FaBell,
  },
  {
    id: 4,
    title: "Analytics",
    description: "Theo dõi hiệu suất hệ thống",
    icon: FaChartLine,
  },
  {
    id: 5,
    title: "Rewards",
    description: "Điểm thưởng & loyalty",
    icon: FaGift,
  },
  {
    id: 6,
    title: "Mini Games",
    description: "Realtime leaderboard system",
    icon: FaGamepad,
  },
];

function SystemDemoActions() {
  return (
    <section className="px-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-bold">
          System Operations
        </h2>

        <span className="text-xs text-orange-400 font-medium">
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <div
              key={action.id}
              className="
                bg-[#1A1A1A]
                border
                border-[#2A2A2A]
                rounded-[24px]
                p-4
                min-h-[120px]
                flex
                flex-col
                justify-between
                transition-all
                duration-300
                hover:border-orange-500
              "
            >
              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-orange-500/15
                  flex
                  items-center
                  justify-center
                "
              >
                <Icon className="text-orange-400 text-xl" />
              </div>

              <div className="mt-4">
                <h3 className="text-white text-sm font-semibold">
                  {action.title}
                </h3>

                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SystemDemoActions;