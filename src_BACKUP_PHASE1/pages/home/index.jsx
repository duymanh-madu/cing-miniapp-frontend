import {
  useNavigate,
} from "react-router-dom";

export default function HomePage() {

  const navigate =
    useNavigate();

  const quickActions = [

    {
      title: "Xem Menu",
      icon: "🧋",
      route: "/menu",
      color:
        "from-[#ff9a1f] to-[#ff7a00]",
    },

    {
      title: "Top tiêu dùng",
      icon: "🏆",
      route: "/top-spending",
      color:
        "from-[#d97706] to-[#92400e]",
    },

    {
      title: "Game Center",
      icon: "🎮",
      route: "/games",
      color:
        "from-[#2b160b] to-[#5b2d12]",
    },

    {
      title: "Voucher",
      icon: "🎁",
      route: "/vouchers",
      color:
        "from-[#f59e0b] to-[#ea580c]",
    },

    {
      title: "Hạng thành viên",
      icon: "💎",
      route: "/membership",
      color:
        "from-[#c19b61] to-[#8b5e34]",
    },

  ];

  return (

    <div
      className="
        min-h-screen
        bg-[#f6efe4]
        overflow-x-hidden
      "
    >

      {/* ===================== */}
      {/* HERO HEADER */}
      {/* ===================== */}

      <div
        className="
          relative
          px-4
          pt-5
          pb-6
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#ff8a00]
            to-[#d96b00]
          "
        />

        <div
          className="
            relative
            z-10
          "
        >

          {/* TOP BAR */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            {/* LEFT */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  w-[54px]
                  h-[54px]
                  rounded-2xl
                  bg-[#fff3e2]
                  shadow-lg
                  overflow-hidden
                  flex
                  items-center
                  justify-center
                "
              >

                <img
                  src="/logo-cing.png"
                  alt="logo"
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                />

              </div>

              <div>

                <div
                  className="
                    text-white/80
                    text-[12px]
                    font-bold
                    tracking-[2px]
                  "
                >

                  CING HU TANG

                </div>

                <div
                  className="
                    text-white
                    text-[24px]
                    font-black
                    leading-none
                  "
                >

                  Xin chào 👋

                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div
              className="
                w-[50px]
                h-[50px]
                rounded-full
                overflow-hidden
                border-2
                border-white/30
                shadow-lg
              "
            >

              <img
                src="https://i.pravatar.cc/200"
                alt="avatar"
                className="
                  w-full
                  h-full
                  object-cover
                "
              />

            </div>

          </div>

          {/* MEMBER CARD */}

          <div
            className="
              mt-5
              rounded-[30px]
              bg-white/15
              backdrop-blur-xl
              border
              border-white/20
              p-5
              shadow-2xl
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <div
                  className="
                    text-white/80
                    text-sm
                    font-bold
                  "
                >

                  HẠNG THÀNH VIÊN

                </div>

                <div
                  className="
                    text-white
                    text-[32px]
                    font-black
                    leading-none
                    mt-1
                  "
                >

                  GOLD

                </div>

              </div>

              <div
                className="
                  text-right
                "
              >

                <div
                  className="
                    text-white/80
                    text-sm
                    font-bold
                  "
                >

                  ĐIỂM TÍCH LUỸ

                </div>

                <div
                  className="
                    text-white
                    text-[30px]
                    font-black
                    mt-1
                  "
                >

                  12,580

                </div>

              </div>

            </div>

            {/* PROGRESS */}

            <div
              className="
                mt-5
              "
            >

              <div
                className="
                  h-[12px]
                  rounded-full
                  bg-white/20
                  overflow-hidden
                "
              >

                <div
                  className="
                    h-full
                    w-[68%]
                    bg-white
                    rounded-full
                  "
                />

              </div>

              <div
                className="
                  flex
                  justify-between
                  mt-2
                  text-white/80
                  text-xs
                  font-bold
                "
              >

                <span>
                  GOLD
                </span>

                <span>
                  NEXT: DIAMOND
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ===================== */}
      {/* QUICK ACTIONS */}
      {/* ===================== */}

      <div
        className="
          px-4
          -mt-2
          pb-32
        "
      >

        <div
          className="
            grid
            grid-cols-2
            gap-4
          "
        >

          {
            quickActions.map(
              (
                item
              ) => (

                <button
                  key={
                    item.title
                  }
                  onClick={() =>
                    navigate(
                      item.route
                    )
                  }
                  className={`
                    relative
                    overflow-hidden
                    rounded-[28px]
                    p-5
                    h-[150px]
                    shadow-xl
                    text-left
                    bg-gradient-to-br
                    ${item.color}
                  `}
                >

                  {/* GLOW */}

                  <div
                    className="
                      absolute
                      -right-8
                      -top-8
                      w-[120px]
                      h-[120px]
                      rounded-full
                      bg-white/10
                    "
                  />

                  <div
                    className="
                      relative
                      z-10
                      h-full
                      flex
                      flex-col
                      justify-between
                    "
                  >

                    <div
                      className="
                        text-[42px]
                      "
                    >

                      {
                        item.icon
                      }

                    </div>

                    <div
                      className="
                        text-white
                        text-[22px]
                        font-black
                        leading-tight
                      "
                    >

                      {
                        item.title
                      }

                    </div>

                  </div>

                </button>

              )
            )
          }

        </div>

      </div>

      {/* ===================== */}
      {/* BOTTOM NAV */}
      {/* ===================== */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          px-4
          pb-4
          pointer-events-none
        "
      >

        <div
          className="
            max-w-[420px]
            mx-auto
            rounded-[28px]
            bg-[#2b160b]/95
            backdrop-blur-xl
            shadow-2xl
            px-6
            py-4
            flex
            items-center
            justify-between
            pointer-events-auto
          "
        >

          {
            [
              {
                icon: "🏠",
                label: "Home",
              },

              {
                icon: "🧋",
                label: "Menu",
              },

              {
                icon: "🎮",
                label: "Games",
              },

              {
                icon: "🎁",
                label: "Voucher",
              },

              {
                icon: "👤",
                label: "Profile",
              },

            ].map(
              (
                item
              ) => (

                <button
                  key={
                    item.label
                  }
                  className="
                    flex
                    flex-col
                    items-center
                    gap-1
                    text-white
                  "
                >

                  <div
                    className="
                      text-[22px]
                    "
                  >

                    {
                      item.icon
                    }

                  </div>

                  <div
                    className="
                      text-[11px]
                      font-bold
                    "
                  >

                    {
                      item.label
                    }

                  </div>

                </button>

              )
            )
          }

        </div>

      </div>

    </div>

  );

}