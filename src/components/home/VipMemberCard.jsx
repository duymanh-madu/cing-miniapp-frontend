import {
  FaCrown,
  FaStar,
} from "react-icons/fa6";

import useAuth from "../../hooks/useAuth";

/**
 * ============================================
 * VIP MEMBER CARD
 * ============================================
 */

function VipMemberCard() {
  const {
    user,
  } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[34px]
        bg-gradient-to-br
        from-[#1f1300]
        via-[#2b1800]
        to-[#5c3900]
        p-5
        text-white
        shadow-[0_25px_60px_rgba(0,0,0,0.25)]
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
          bg-yellow-400/10
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
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white/10
                px-3
                py-1.5
                backdrop-blur-xl
              "
            >
              <FaCrown
                className="
                  text-yellow-300
                  text-xs
                "
              />

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                "
              >
                VIP MEMBER
              </span>
            </div>

            <h2
              className="
                mt-4
                text-[26px]
                font-black
              "
            >
              {user.name}
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-white/70
              "
            >
              Hạng thành viên:
              {" "}
              {user.tier}
            </p>
          </div>

          <div
            className="
              flex
              h-[64px]
              w-[64px]
              items-center
              justify-center
              rounded-[24px]
              bg-white/10
              text-[30px]
              backdrop-blur-xl
            "
          >
            {user.avatar}
          </div>
        </div>

        {/* POINTS */}

        <div
          className="
            mt-6
            rounded-[24px]
            bg-white/10
            p-4
            backdrop-blur-xl
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
              <p
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.14em]
                  text-white/60
                "
              >
                Loyalty Points
              </p>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-2
                "
              >
                <FaStar
                  className="
                    text-yellow-300
                  "
                />

                <span
                  className="
                    text-[28px]
                    font-black
                  "
                >
                  {user.points}
                </span>
              </div>
            </div>

            <button
              className="
                h-[52px]
                rounded-2xl
                bg-brand-orange
                px-5
                text-sm
                font-black
                shadow-[0_15px_35px_rgba(242,140,40,0.35)]
              "
            >
              Xem quyền lợi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VipMemberCard;