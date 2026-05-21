import realtimeGameStore from "@/stores/realtimeGameStore";

class GameEngineRuntime {

  started =
    false;

  animationFrame =
    null;

  start() {

    if (
      this.started
    ) {

      return;

    }

    this.started =
      true;

    realtimeGameStore
      .getState()
      .setGameRunning(
        true
      );

    this.loop();

  }

  stop() {

    this.started =
      false;

    cancelAnimationFrame(
      this.animationFrame
    );

    realtimeGameStore
      .getState()
      .setGameRunning(
        false
      );

  }

  loop() {

    if (
      !this.started
    ) {

      return;

    }

    realtimeGameStore
      .getState()
      .increaseTick();

    this.animationFrame =
      requestAnimationFrame(
        () => {

          this.loop();

        }
      );

  }

}

const gameEngineRuntime =
  new GameEngineRuntime();

export default
  gameEngineRuntime;