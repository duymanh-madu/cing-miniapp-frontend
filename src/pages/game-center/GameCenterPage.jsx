import {
  Trophy,
  Play,
  ArrowLeft,
  Gamepad2,
  ChevronRight,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

/**
 * =====================================================
 * GAME CENTER
 * ULTRA COMPACT VIP PRO
 * =====================================================
 */

function GameCenterPage() {

  const navigate =
    useNavigate();

  return (

    <div
      className="
        min-h-screen
        bg-[#f5efe5]
      "
    >

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-[#f5efe5]/95
          backdrop-blur-xl
          border-b
          border-[#eadfce]
        "
      >

        <div
          className="
            px-4
            py-4
            flex
            items-center
            gap-3
          "
        >

          {/* BACK */}

          <button
            onClick={() =>
              navigate("/")
            }
            className="
              w-11
              h-11
              rounded-2xl
              bg-white
              border
              border-[#eadfce]
              shadow-md
              flex
              items-center
              justify-center
              text-[#2b160b]
              active:scale-95
            "
          >

            <ArrowLeft size={20} />

          </button>

          {/* TITLE */}

          <div>

            <div
              className="
                text-[11px]
                font-black
                tracking-[3px]
                uppercase
                text-[#c79b63]
              "
            >

              Mini Game

            </div>

            <h1
              className="
                text-[34px]
                leading-none
                font-black
                text-[#2b160b]
              "
            >

              Game Center

            </h1>

          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* CONTENT */}
      {/* ========================================= */}

      <div
        className="
          p-4
          grid
          grid-cols-2
          gap-4
        "
      >

        {/* ========================================= */}
        {/* PLAY GAME */}
        {/* ========================================= */}

        <button
          onClick={() =>
            navigate("/game")
          }
          className="
            relative
            overflow-hidden
            rounded-[28px]
            h-[160px]
            p-5
            bg-gradient-to-br
            from-[#2b1207]
            via-[#5f2200]
            to-[#2b1207]
            shadow-2xl
            text-left
            active:scale-[0.98]
            transition-all
          "
        >

          {/* GLOW */}

          <div
            className="
              absolute
              top-[-40px]
              right-[-40px]
              w-[120px]
              h-[120px]
              rounded-full
              bg-white/10
            "
          />

          {/* TOP */}

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
                  w-14
                  h-14
                  rounded-2xl
                  bg-white/10
                  backdrop-blur-md
                  flex
                  items-center
                  justify-center
                "
              >

                <Gamepad2
                  size={28}
                  className="
                    text-white
                  "
                />

              </div>

              <div>

                <div
                  className="
                    text-[#f4c37c]
                    text-[10px]
                    font-black
                    tracking-[2px]
                    uppercase
                  "
                >

                  HOT GAME

                </div>

                <div
                  className="
                    mt-1
                    text-white
                    text-[24px]
                    leading-[1.05]
                    font-black
                  "
                >

                  Bay cùng
                  trân châu

                </div>

              </div>

            </div>

            <ChevronRight
              size={30}
              className="
                text-white/70
              "
            />

          </div>

          {/* BOTTOM */}

          <div
            className="
              absolute
              left-5
              right-5
              bottom-5
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                text-[#f5d7b3]
                text-[13px]
                font-bold
              "
            >

              ⚡ Combo realtime

            </div>

            <div
              className="
                h-11
                px-5
                rounded-2xl
                bg-gradient-to-r
                from-[#ffbe55]
                to-[#ff7a00]
                flex
                items-center
                gap-2
                text-white
                font-black
                text-[15px]
                shadow-xl
              "
            >

              <Play size={14} />

              Chơi

            </div>

          </div>

        </button>

        {/* ========================================= */}
        {/* LEADERBOARD */}
        {/* ========================================= */}

        <button
          onClick={() =>
            navigate(
              "/leaderboard/black-pearl-rush"
            )
          }
          className="
            relative
            overflow-hidden
            rounded-[28px]
            h-[160px]
            p-5
            bg-gradient-to-br
            from-[#ffbe55]
            via-[#ff9800]
            to-[#ff7a00]
            shadow-2xl
            text-left
            active:scale-[0.98]
            transition-all
          "
        >

          {/* GLOW */}

          <div
            className="
              absolute
              bottom-[-40px]
              right-[-40px]
              w-[120px]
              h-[120px]
              rounded-full
              bg-white/15
            "
          />

          {/* TOP */}

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
                  w-14
                  h-14
                  rounded-2xl
                  bg-white/20
                  backdrop-blur-md
                  flex
                  items-center
                  justify-center
                "
              >

                <Trophy
                  size={28}
                  className="
                    text-white
                  "
                />

              </div>

              <div>

                <div
                  className="
                    text-white/80
                    text-[10px]
                    font-black
                    tracking-[2px]
                    uppercase
                  "
                >

                  BXH REALTIME

                </div>

                <div
                  className="
                    mt-1
                    text-white
                    text-[32px]
                    leading-none
                    font-black
                  "
                >

                  TOP 100

                </div>

              </div>

            </div>

            <ChevronRight
              size={30}
              className="
                text-white/70
              "
            />

          </div>

          {/* BOTTOM */}

          <div
            className="
              absolute
              left-5
              right-5
              bottom-5
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                text-white
                text-[13px]
                font-bold
              "
            >

              🏆 Bảng xếp hạng

            </div>

            <div
              className="
                h-11
                px-5
                rounded-2xl
                bg-white
                flex
                items-center
                gap-2
                text-[#ff8a00]
                font-black
                text-[15px]
                shadow-xl
              "
            >

              <Trophy size={14} />

              BXH

            </div>

          </div>

        </button>

      </div>

    </div>

  );

}

export default GameCenterPage;