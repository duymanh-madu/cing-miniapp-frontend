import axios from "axios";

class GameRewardRuntime {

  async submitScore(
    score
  ) {

    try {

      const token =
        localStorage.getItem(
          "miniapp_jwt"
        );

      await axios.post(

        `${import.meta.env.VITE_API_BASE_URL}/game/score`,

        {
          score,
        },

        {

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        }

      );

    } catch (error) {

      console.error(
        "submit score failed",
        error
      );

    }

  }

}

const gameRewardRuntime =
  new GameRewardRuntime();

export default
  gameRewardRuntime;