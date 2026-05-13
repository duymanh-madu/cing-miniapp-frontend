import {
  FaArrowRight,
  FaBolt,
  FaTrophy,
} from "react-icons/fa6";

/**
 * ============================================
 * MOCK EVENT
 * ============================================
 */

const mockEvent = {
  title:
    "Bubble Rush Tournament",

  subtitle:
    "Giải đấu kỹ năng mùa hè",

  jackpot:
    "12.500.000đ",

  players:
    "24.8K",

  countdown:
    "02:18:42",

  banner:
    "⚡",
};

/**
 * ============================================
 * GAME PROMO CARD
 * ============================================
 */

function GamePromoCard() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[36px]
        bg-gradient-to-br
        from-[#2b1800]
        via-[#4a2900]
        to-[#f28c28]
        p-5
        text-white
        shadow-[0_25px_60px_rgba(0,0,0,0.22)]
      "
    >
      {/* BACKGROUND GLOW */}

      <div
        className="
          absolute
          right-[-40px]
          top-[-40px]
          h-[180px]
          w-[180px]
          rounded-full
          bg-orange-300/20
          blur-3xl
        "
      />

      <div
        className="
          absolute
          bottom-[-60px]
          left-[-40px]
          h-[180px]
          w-[180px]
          rounded-full
          bg-yellow-200/10
          blur-3xl
        "
      />

      {/* GRID */}

      <div
        className="
          relative
          z-10
          flex
          items-start
          justify-between
          gap-5
        "
      >
        {/* LEFT */}

        <div className="flex-1">
          {/* TAG */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/10
              px-3
              py-1.5
              backdrop-blur-xl
            "
          >
            <FaBolt className="text-[11px] text-orange-200" />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-orange-100
              "
            >
              LIVE EVENT
            </span>
          </div>

          {/* TITLE */}

          <h2
            className="
              mt-4
              text-[28px]
              font-black
              leading-[1.1]
              tracking-[-0.04em]
            "
          >
            {mockEvent.title}
          </h2>

          {/* SUBTITLE */}

          <p
            className="
              mt-3
              max-w-[240px]
              text-[14px]
              leading-relaxed
              text-orange-100/90
            "
          >
            {mockEvent.subtitle}
          </p>

          {/* STATS */}

          <div
            className="
              mt-5
              flex
              items-center
              gap-3
            "
          >
            {/* PLAYERS */}

            <div
              className="
                rounded-[20px]
                border
                border-white/10
                bg-white/10
                px-4
                py-3
                backdrop-blur-xl
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-orange-100
                "
              >
                Người chơi
              </p>

              <div
                className="
                  mt-1
                  text-[18px]
                  font-black
                "
              >
                {mockEvent.players}
              </div>
            </div>

            {/* COUNTDOWN */}

            <div
              className="
                rounded-[20px]
                border
                border-white/10
                bg-white/10
                px-4
                py-3
                backdrop-blur-xl
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-orange-100
                "
              >
                Kết thúc sau
              </p>

              <div
                className="
                  mt-1
                  text-[18px]
                  font-black
                "
              >
                {mockEvent.countdown}
              </div>
            </div>
          </div>

          {/* CTA */}

          <button
            className="
              mt-6
              flex
              items-center
              gap-3
              rounded-[22px]
              bg-white
              px-5
              py-3.5
              text-[14px]
              font-black
              text-[#2b1800]
              shadow-[0_10px_30px_rgba(255,255,255,0.2)]
              transition-all
              duration-300
              active:scale-[0.98]
            "
          >
            Chơi ngay

            <FaArrowRight />
          </button>
        </div>

        {/* RIGHT */}

        <div
          className="
            flex
            flex-col
            items-center
          "
        >
          {/* ICON */}

          <div
            className="
              flex
              h-[90px]
              w-[90px]
              items-center
              justify-center
              rounded-[30px]
              border
              border-white/10
              bg-white/10
              text-[42px]
              backdrop-blur-xl
            "
          >
            {mockEvent.banner}
          </div>

          {/* JACKPOT */}

          <div
            className="
              mt-4
              rounded-[24px]
              border
              border-yellow-200/20
              bg-gradient-to-br
              from-yellow-300/20
              to-orange-300/10
              px-4
              py-4
              text-center
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                text-yellow-100
              "
            >
              <FaTrophy className="text-[12px]" />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                "
              >
                Jackpot
              </span>
            </div>

            <div
              className="
                mt-2
                text-[22px]
                font-black
                leading-none
                tracking-[-0.03em]
              "
            >
              {mockEvent.jackpot}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GamePromoCard;