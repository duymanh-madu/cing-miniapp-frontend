import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

function TopSpendingLeaderboard() {

  const [
    leaderboard,
    setLeaderboard,
  ] = useState([]);

  useEffect(() => {

    async function load() {

      try {

        const response =
          await axios.get(

            `${import.meta.env.VITE_API_BASE_URL}/leaderboard/top-spending`

          );

        setLeaderboard(
          response.data || []
        );

      } catch (error) {

        console.error(
          "load leaderboard failed",
          error
        );

      }

    }

    load();

  }, []);

  return (

    <div
      className="
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      "
    >

      <div
        className="
          mb-5
          text-xl
          font-black
        "
      >
        Top Spending
      </div>

      <div
        className="
          grid
          gap-3
        "
      >

        {
          leaderboard.map(
            (
              customer,
              index
            ) => (

              <div
                key={
                  customer.id
                }
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  bg-zinc-800
                  p-4
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
                      text-lg
                      font-black
                      text-yellow-400
                    "
                  >
                    #
                    {
                      index + 1
                    }
                  </div>

                  <div>
                    {
                      customer.name
                    }
                  </div>

                </div>

                <div
                  className="
                    text-sm
                    opacity-70
                  "
                >
                  {
                    customer.spending
                      ?.toLocaleString?.()
                  }
                  đ
                </div>

              </div>

            )
          )
        }

      </div>

    </div>

  );

}

export default
  TopSpendingLeaderboard;