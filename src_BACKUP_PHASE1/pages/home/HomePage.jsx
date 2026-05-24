import {
  Link,
} from "react-router-dom";

import {
  Crown,
  Coffee,
  Gamepad2,
  Gift,
  Trophy,
  Sparkles,
  ChevronRight,
  Flame,
  Activity,
  Star,
  Gem,
} from "lucide-react";

/**
 * =====================================================
 * HOME PAGE
 * ULTRA LUXURY VVIP FINAL
 * =====================================================
 */

function HomePage() {

  /**
   * =========================================
   * MEMBER CONFIG
   * =========================================
   */

  const memberRank =
    "GOLD";

  const memberThemes = {

    BRONZE: {
      card:
        "from-[#5b2d0f] via-[#8a4b1f] to-[#c17b3f]",
      glow:
        "shadow-[0_30px_80px_rgba(120,60,20,0.45)]",
      badge:
        "bg-[#2d1205]/40",
    },

    SILVER: {
      card:
        "from-[#4b5563] via-[#9ca3af] to-[#e5e7eb]",
      glow:
        "shadow-[0_30px_80px_rgba(180,180,180,0.45)]",
      badge:
        "bg-black/20",
    },

    GOLD: {
      card:
        "from-[#ff8a00] via-[#ff6b00] to-[#ffb347]",
      glow:
        "shadow-[0_30px_90px_rgba(255,115,0,0.45)]",
      badge:
        "bg-[#5b2100]/30",
    },

    DIAMOND: {
      card:
        "from-[#2563eb] via-[#38bdf8] to-[#dbeafe]",
      glow:
        "shadow-[0_30px_90px_rgba(80,170,255,0.45)]",
      badge:
        "bg-[#021b38]/30",
    },

  };

  const currentTheme =
    memberThemes[
      memberRank
    ];

  /**
   * =========================================
   * QUICK ACCESS
   * =========================================
   */

  const quickActions = [

    {
      title: "Menu",
      icon: Coffee,
      to: "/menu",
      gradient:
        "from-[#ffb347] via-[#ff9800] to-[#ff6b00]",
    },

    {
      title: "Games",
      icon: Gamepad2,
      to: "/games",
      gradient:
        "from-[#3b1200] via-[#5f1e00] to-[#2a0c00]",
    },

    {
      title: "Voucher",
      icon: Gift,
      to: "/voucher",
      gradient:
        "from-[#ffcf71] via-[#ff9f1c] to-[#ff6b00]",
    },

    {
      title: "BXH",
      icon: Trophy,
      to: "/leaderboard/black-pearl-rush",
      gradient:
        "from-[#7c2d12] via-[#92400e] to-[#451a03]",
    },

  ];

  return (

    <div
      className="
        min-h-screen
        overflow-hidden
        bg-[#f6f1e7]
        pb-32
        text-[#1f1208]
      "
    >

      {/* ========================================= */}
      {/* BACKGROUND FX */}
      {/* ========================================= */}

      <div
        className="
          fixed
          inset-0
          pointer-events-none
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            right-[-120px]
            top-[-120px]
            h-[320px]
            w-[320px]
            rounded-full
            bg-orange-300/30
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-100px]
            left-[-100px]
            h-[260px]
            w-[260px]
            rounded-full
            bg-yellow-200/30
            blur-3xl
          "
        />

      </div>

      {/* ========================================= */}
      {/* HERO */}
      {/* ========================================= */}

      <div
        className="
          relative
          overflow-hidden
          rounded-b-[42px]
          bg-gradient-to-br
          from-[#ff8a00]
          via-[#ff7300]
          to-[#c2410c]
          px-5
          pt-5
          pb-8
          shadow-[0_25px_70px_rgba(255,115,0,0.35)]
        "
      >

        {/* FX */}

        <div
          className="
            absolute
            right-[-40px]
            top-[-40px]
            h-48
            w-48
            rounded-full
            bg-white/10
          "
        />

        <div
          className="
            absolute
            left-[-50px]
            bottom-[-50px]
            h-44
            w-44
            rounded-full
            bg-yellow-200/10
          "
        />

        {/* TOP */}

        <div
          className="
            relative
            z-10
            flex
            items-center
            justify-between
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-3xl
                bg-white
                shadow-2xl
              "
            >

              <img
                src="/logo-cing.png"
                alt="logo"
                className="
                  h-11
                  w-11
                  object-contain
                "
              />

            </div>

            <div>

              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.35em]
                  text-yellow-100
                "
              >

                CING HU TANG

              </p>

              <h1
                className="
                  mt-1
                  text-5xl
                  font-black
                  leading-none
                  text-[#2b1105]
                  drop-shadow-[0_2px_0_rgba(255,215,0,0.7)]
                "
              >

                Xin chào 👋

              </h1>

            </div>

          </div>

          <img
            src="https://i.pravatar.cc/150"
            alt="avatar"
            className="
              h-16
              w-16
              rounded-full
              border-4
              border-yellow-200
              object-cover
              shadow-2xl
            "
          />

        </div>

        {/* ========================================= */}
        {/* MEMBER CARD */}
        {/* ========================================= */}

        <div
          className={`
            relative
            z-10
            mt-6
            overflow-hidden
            rounded-[38px]
            border
            border-white/20
            bg-gradient-to-br
            ${currentTheme.card}
            p-6
            ${currentTheme.glow}
          `}
        >

          {/* SHINE */}

          <div
            className="
              absolute
              right-[-30px]
              top-[-30px]
              h-44
              w-44
              rounded-full
              bg-white/15
            "
          />

          <div
            className="
              absolute
              left-[-20px]
              bottom-[-20px]
              h-28
              w-28
              rounded-full
              bg-yellow-200/10
            "
          />

          {/* HEADER */}

          <div
            className="
              relative
              flex
              items-start
              justify-between
              gap-5
            "
          >

            <div>

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  ${currentTheme.badge}
                  backdrop-blur-xl
                `}
              >

                <Gem
                  size={16}
                  className="
                    text-yellow-200
                  "
                />

                <span
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.25em]
                    text-yellow-50
                  "
                >

                  VIP MEMBER

                </span>

              </div>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-3xl
                    bg-white/15
                    backdrop-blur-xl
                  "
                >

                  <Crown
                    size={34}
                    className="
                      text-yellow-200
                    "
                  />

                </div>

                <div>

                  <p
                    className="
                      text-sm
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-yellow-100
                    "
                  >

                    Hạng thành viên

                  </p>

                  <h2
                    className="
                      mt-1
                      text-7xl
                      font-black
                      leading-none
                      text-[#2b1105]
                      drop-shadow-[0_3px_0_rgba(255,215,0,0.8)]
                    "
                  >

                    GOLD

                  </h2>

                </div>

              </div>

            </div>

            <div
              className="
                text-right
              "
            >

              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-yellow-100
                "
              >

                Điểm tích lũy

              </p>

              <h3
                className="
                  mt-3
                  text-6xl
                  font-black
                  leading-none
                  text-[#2b1105]
                  drop-shadow-[0_2px_0_rgba(255,215,0,0.7)]
                "
              >

                12.580

              </h3>

            </div>

          </div>

          {/* PROGRESS */}

          <div
            className="
              relative
              mt-7
            "
          >

            <div
              className="
                h-5
                overflow-hidden
                rounded-full
                bg-white/25
                backdrop-blur-xl
              "
            >

              <div
                className="
                  h-full
                  w-[74%]
                  rounded-full
                  bg-white
                "
              />

            </div>

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                text-sm
                font-black
                text-yellow-50
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

          {/* STATS */}

          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-3
            "
          >

            <div
              className="
                rounded-3xl
                bg-white/12
                p-4
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-yellow-100
                "
              >

                <Flame size={15} />

                <span
                  className="
                    text-xs
                    font-black
                    uppercase
                  "
                >
                  Streak
                </span>

              </div>

              <h4
                className="
                  mt-3
                  text-4xl
                  font-black
                  text-[#2b1105]
                "
              >
                12
              </h4>

            </div>

            <div
              className="
                rounded-3xl
                bg-white/12
                p-4
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-yellow-100
                "
              >

                <Gift size={15} />

                <span
                  className="
                    text-xs
                    font-black
                    uppercase
                  "
                >
                  Rewards
                </span>

              </div>

              <h4
                className="
                  mt-3
                  text-4xl
                  font-black
                  text-[#2b1105]
                "
              >
                08
              </h4>

            </div>

            <div
              className="
                rounded-3xl
                bg-white/12
                p-4
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-yellow-100
                "
              >

                <Star size={15} />

                <span
                  className="
                    text-xs
                    font-black
                    uppercase
                  "
                >
                  VIP
                </span>

              </div>

              <h4
                className="
                  mt-3
                  text-4xl
                  font-black
                  text-[#2b1105]
                "
              >
                PRO
              </h4>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* QUICK ACCESS */}
      {/* ========================================= */}

      <div
        className="
          relative
          z-10
          px-5
          pt-6
        "
      >

        {/* TITLE */}

        <div
          className="
            flex
            items-end
            justify-between
          "
        >

          <div>

            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.35em]
                text-[#b45309]
              "
            >

              Realtime Ecosystem

            </p>

            <h2
              className="
                mt-2
                text-5xl
                font-black
                leading-none
                text-[#1f1208]
              "
            >

              Truy cập nhanh

            </h2>

          </div>

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-white
              px-4
              py-2
              shadow-lg
            "
          >

            <Activity
              size={16}
              className="
                text-green-500
              "
            />

            <span
              className="
                text-sm
                font-black
              "
            >

              LIVE

            </span>

          </div>

        </div>

        {/* BUTTON GRID */}

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
          "
        >

          {quickActions.map(
            (
              action
            ) => {

              const Icon =
                action.icon;

              return (

                <Link
                  key={
                    action.title
                  }
                  to={
                    action.to
                  }
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-[30px]
                    bg-gradient-to-br
                    ${action.gradient}
                    p-4
                    shadow-xl
                    transition-all
                    duration-300
                    active:scale-[0.98]
                  `}
                >

                  <div
                    className="
                      absolute
                      right-[-20px]
                      top-[-20px]
                      h-24
                      w-24
                      rounded-full
                      bg-white/10
                    "
                  />

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-white/15
                          backdrop-blur-xl
                        "
                      >

                        <Icon
                          size={22}
                          className="
                            text-white
                          "
                        />

                      </div>

                      <div>

                        <h3
                          className="
                            text-2xl
                            font-black
                            text-[#1f1208]
                            drop-shadow-[0_1px_0_rgba(255,215,0,0.6)]
                          "
                        >

                          {action.title}

                        </h3>

                      </div>

                    </div>

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        shadow-lg
                        transition-all
                        duration-300
                        group-hover:translate-x-1
                      "
                    >

                      <ChevronRight
                        size={18}
                        className="
                          text-black
                        "
                      />

                    </div>

                  </div>

                </Link>

              );

            }
          )}

        </div>

      </div>

    </div>

  );

}

export default HomePage;