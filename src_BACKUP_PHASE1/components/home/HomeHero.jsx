import {
  FaBell,
} from "react-icons/fa6";

import RealtimeStatusBadge from "../header/RealtimeStatusBadge";

/**
 * ============================================
 * HOME HERO
 * ============================================
 */

function HomeHero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[34px]
        bg-gradient-to-br
        from-[#f28c28]
        via-orange-400
        to-orange-500
        p-6
        text-white
        shadow-[0_25px_60px_rgba(242,140,40,0.35)]
      "
    >
      {/* BG */}

      <div
        className="
          absolute
          -right-10
          -top-10
          h-[180px]
          w-[180px]
          rounded-full
          bg-white/10
        "
      />

      <div
        className="
          absolute
          -bottom-10
          -left-10
          h-[120px]
          w-[120px]
          rounded-full
          bg-white/10
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
        "
      >
        {/* TOP */}

        <div
          className="
            flex
            items-start
            justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-medium
                text-white/80
              "
            >
              Xin chào 👋
            </p>

            <h1
              className="
                mt-2
                text-[32px]
                font-black
                leading-tight
              "
            >
              Cing Hu Tang
            </h1>
          </div>

          <button
            className="
              h-[52px]
              w-[52px]
              rounded-2xl
              bg-white/15
              backdrop-blur-xl
              flex
              items-center
              justify-center
              border
              border-white/20
            "
          >
            <FaBell
              className="
                text-xl
              "
            />
          </button>
        </div>

        {/* STATUS */}

        <div
          className="
            mt-5
          "
        >
          <RealtimeStatusBadge />
        </div>

        {/* DESCRIPTION */}

        <p
          className="
            mt-5
            max-w-[280px]
            text-sm
            leading-relaxed
            text-white/85
          "
        >
          Thưởng thức trà sữa premium,
          nhận voucher realtime và
          tham gia mini game mỗi ngày.
        </p>
      </div>
    </section>
  );
}

export default HomeHero;