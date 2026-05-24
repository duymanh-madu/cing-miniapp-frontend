import {
  useEffect,
} from "react";

import realtimeGameStore from "@/games/store/gameRuntimeStore";

import gameLeaderboardRuntime from "@/game/runtime/gameLeaderboardRuntime";

function GameLeaderboard() {

  const leaderboard =
    realtimeGameStore(
      (state) =>
        state.leaderboard
    );

  useEffect(() => {

    gameLeaderboardRuntime
      .loadTop100();

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
          text-2xl
          font-black
        "
      >
        Top 100 Players
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
              player,
              index
            ) => (

              <div
                key={
                  player.id
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
                      player.name
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
                    player.score
                  }
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
  GameLeaderboard;