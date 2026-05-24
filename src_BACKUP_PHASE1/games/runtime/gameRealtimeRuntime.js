import {

  getRuntimeSocket,

  registerSocketListener,

} from "@/runtime/socket/runtimeSocketClient";

/**
 * =====================================================
 * GAME REALTIME RUNTIME
 * =====================================================
 */

class GameRealtimeRuntime {

  socket = null;

  initialized =
    false;

  unsubscribers = [];

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    this.socket =
      getRuntimeSocket();

    if (
      !this.socket
    ) {

      return;

    }

    this.registerEvents();

    this.initialized =
      true;

  }

  registerEvents() {

    this.unsubscribers.push(

      registerSocketListener(

        "game:leaderboard:update",

        (
          payload
        ) => {

          console.log(

            "[GAME REALTIME] LEADERBOARD",

            payload

          );

        }

      )

    );

    this.unsubscribers.push(

      registerSocketListener(

        "game:event",

        (
          payload
        ) => {

          console.log(

            "[GAME REALTIME EVENT]",

            payload

          );

        }

      )

    );

  }

  emit(
    event,
    payload
  ) {

    if (
      !this.socket
    ) {

      return;

    }

    this.socket.emit(
      event,
      payload
    );

  }

  destroy() {

    this.unsubscribers.forEach(
      (
        unsubscribe
      ) => {

        unsubscribe();

      }
    );

    this.unsubscribers = [];

    this.initialized =
      false;

  }

}

const gameRealtimeRuntime =
  new GameRealtimeRuntime();

export default
  gameRealtimeRuntime;
