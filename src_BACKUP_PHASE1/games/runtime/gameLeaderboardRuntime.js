import axios from "axios";

import realtimeGameStore from "@/games/store/gameRuntimeStore";

class GameLeaderboardRuntime {

  async loadTop100() {

    try {

      const response =
        await axios.get(

          `${import.meta.env.VITE_API_BASE_URL}/game/leaderboard`

        );

      realtimeGameStore
        .getState()
        .setLeaderboard(
          response.data || []
        );

    } catch (error) {

      console.error(
        "load game leaderboard failed",
        error
      );

    }

  }

}

const gameLeaderboardRuntime =
  new GameLeaderboardRuntime();

export default
  gameLeaderboardRuntime;