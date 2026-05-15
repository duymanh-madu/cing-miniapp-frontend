import io from "socket.io-client";

import realtimeGameStore from "@/stores/realtimeGameStore";

class GameRealtimeRuntime {

  socket =
    null;

  initialize() {

    if (
      this.socket
    ) {

      return;

    }

    this.socket =
      io(
        import.meta.env
          .VITE_SOCKET_URL,
        {
          transports: [
            "websocket",
          ],
        }
      );

    this.socket.on(

      "game:leaderboard",

      (payload) => {

        realtimeGameStore
          .getState()
          .setLeaderboard(
            payload
          );

      }

    );

  }

}

const gameRealtimeRuntime =
  new GameRealtimeRuntime();

export default
  gameRealtimeRuntime;