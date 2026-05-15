import axios from "axios";

import realtimeGameStore from "@/stores/realtimeGameStore";

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