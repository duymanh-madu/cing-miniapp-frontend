// =====================================================
// FILE: src/pages/LeaderboardPage.jsx
// CUSTOMER SPENDING LEADERBOARD
// VIP FINAL
// =====================================================

import {
  ArrowLeft,
  Crown,
  Trophy,
  Medal,
  Calendar,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

function LeaderboardPage() {

  /**
   * =========================================
   * TABS
   * =========================================
   */

  const tabs = [

    "Tháng",
    "Quý",
    "Năm",
    "Campaign",

  ];

  /**
   * =========================================
   * MOCK DATA
   * =========================================
   */

  const leaderboard = [

    {
      rank: 1,
      name: "Trà Sữa King",
      spend:
        "58.200.000đ",
      avatar:
        "https://i.pravatar.cc/150?img=11",
    },

    {
      rank: 2,
      name: "Matcha VIP",
      spend:
        "41.800.000đ",
      avatar:
        "https://i.pravatar.cc/150?img=12",
    },

    {
      rank: 3,
      name: "Olong Master",
      spend:
        "35.900.000đ",
      avatar:
        "https://i.pravatar.cc/150?img=13",
    },

    {
      rank: 4,
      name: "MilkTea Pro",
      spend:
        "28.700.000đ",
      avatar:
        "https://i.pravatar.cc/150?img=14",
    },

    {
      rank: 5,
      name: "Boba Legend",
      spend:
        "22.100.000đ",
      avatar:
        "https://i.pravatar.cc/150?img=15",
    },

  ];

  /**
   * =========================================
   * MY RANK
   * =========================================
   */

  const myRank = {

    rank: 38,
    name: "Nguyễn Duy Mạnh",
    spend:
      "6.820.000đ",
    avatar:
      "https://i.pravatar.cc/150?img=16",

  };

  return (

    <div
      className="
        min-h-screen
        bg-[#f6f1e7]
        pb-36
      "
    >

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          border-b
          border-[#eadcc9]
          bg-[#f6f1e7]/90
          backdrop-blur-xl
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <Link
              to="/"
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white
                shadow-lg
              "
            >

              <ArrowLeft
                size={22}
              />

            </Link>

            <div>

              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-orange-500
                "
              >

                Realtime Ranking

              </p>

              <h1
                className="
                  text-5xl
                  font-black
                  text-[#2b1105]
                "
              >

                Top Chi Tiêu

              </h1>

            </div>

          </div>

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-3xl
              bg-gradient-to-br
              from-orange-500
              to-amber-400
              shadow-xl
            "
          >

            <Trophy
              size={28}
              className="
                text-white
              "
            />

          </div>

        </div>

        {/* FILTER */}

        <div
          className="
            flex
            gap-3
            overflow-x-auto
            px-5
            pb-5
            scrollbar-hide
          "
        >

          {tabs.map(
            (
              tab
            ) => (

              <button
                key={tab}
                className="
                  whitespace-nowrap
                  rounded-full
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-black
                  shadow-md
                "
              >

                {tab}

              </button>

            )
          )}

        </div>

      </div>

      {/* TOP 3 */}

      <div
        className="
          grid
          grid-cols-3
          gap-3
          px-5
          pt-6
        "
      >

        {leaderboard
          .slice(0, 3)
          .map(
            (
              user
            ) => (

              <div
                key={user.rank}
                className="
                  rounded-[28px]
                  bg-white
                  p-4
                  text-center
                  shadow-xl
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-orange-500
                    to-yellow-400
                    text-white
                  "
                >

                  <Crown
                    size={20}
                  />

                </div>

                <img
                  src={
                    user.avatar
                  }
                  alt={
                    user.name
                  }
                  className="
                    mx-auto
                    mt-3
                    h-20
                    w-20
                    rounded-full
                    border-4
                    border-orange-200
                    object-cover
                  "
                />

                <h3
                  className="
                    mt-3
                    line-clamp-1
                    text-lg
                    font-black
                    text-[#2b1105]
                  "
                >

                  {user.name}

                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    font-bold
                    text-orange-500
                  "
                >

                  {user.spend}

                </p>

              </div>

            )
          )}

      </div>

      {/* LIST */}

      <div
        className="
          mt-5
          space-y-3
          px-5
        "
      >

        {leaderboard
          .slice(3)
          .map(
            (
              user
            ) => (

              <div
                key={user.rank}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-[28px]
                  bg-white
                  p-4
                  shadow-lg
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
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-orange-100
                      font-black
                      text-orange-600
                    "
                  >

                    #{user.rank}

                  </div>

                  <img
                    src={
                      user.avatar
                    }
                    alt={
                      user.name
                    }
                    className="
                      h-14
                      w-14
                      rounded-full
                      object-cover
                    "
                  />

                  <div>

                    <h3
                      className="
                        text-lg
                        font-black
                        text-[#2b1105]
                      "
                    >

                      {user.name}

                    </h3>

                    <p
                      className="
                        text-sm
                        font-bold
                        text-orange-500
                      "
                    >

                      {user.spend}

                    </p>

                  </div>

                </div>

                <Medal
                  className="
                    text-yellow-500
                  "
                />

              </div>

            )
          )}

      </div>

      {/* MY RANK */}

      <div
        className="
          fixed
          bottom-5
          left-5
          right-5
          rounded-[32px]
          bg-gradient-to-r
          from-[#2b1105]
          to-[#4b1d0b]
          p-5
          text-white
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
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-orange-500
                font-black
              "
            >

              #{myRank.rank}

            </div>

            <img
              src={
                myRank.avatar
              }
              alt={
                myRank.name
              }
              className="
                h-14
                w-14
                rounded-full
                object-cover
              "
            />

            <div>

              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-orange-200
                "
              >

                Thứ hạng của bạn

              </p>

              <h3
                className="
                  text-xl
                  font-black
                "
              >

                {myRank.name}

              </h3>

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
                text-orange-200
              "
            >

              Tổng chi tiêu

            </p>

            <h3
              className="
                mt-1
                text-2xl
                font-black
              "
            >

              {myRank.spend}

            </h3>

          </div>

        </div>

      </div>

    </div>

  );

}

export default LeaderboardPage;