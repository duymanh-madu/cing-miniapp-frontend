import realtimeGameStore from "@/stores/realtimeGameStore";

import gamePhysicsRuntime from "./gamePhysicsRuntime";

import gameObstacleRuntime from "./gameObstacleRuntime";

import gameCollisionRuntime from "./gameCollisionRuntime";

import gameRewardRuntime from "./gameRewardRuntime";

import gameComboRuntime from "./gameComboRuntime";

import gameAudioRuntime from "./gameAudioRuntime";

import gameHapticRuntime from "./gameHapticRuntime";

import gameBackgroundRuntime from "./gameBackgroundRuntime";

class GameLoopRuntime {

  interval =
    null;

  frame =
    0;

  start() {

    this.stop();

    gameObstacleRuntime
      .initialize();

    this.interval =
      setInterval(
        () => {

          this.frame++;

          gamePhysicsRuntime
            .update();

          gameObstacleRuntime
            .update();

          gameBackgroundRuntime
            .update();

          if (
            this.frame % 90 === 0
          ) {

            gameObstacleRuntime
              .generate();

            gameComboRuntime
              .increase();

            gameAudioRuntime
              .play(
                "score"
              );

          }

          const collision =
            gameCollisionRuntime
              .check();

          if (
            collision
          ) {

            this.gameOver();

          }

        },
        16
      );

  }

  async gameOver() {

    this.stop();

    gameComboRuntime
      .reset();

    gameAudioRuntime
      .play(
        "hit"
      );

    gameHapticRuntime
      .collision();

    const state =
      realtimeGameStore
        .getState();

    if (

      state.score >
      state.bestScore

    ) {

      state.setBestScore(
        state.score
      );

    }

    await gameRewardRuntime
      .submitScore(
        state.score
      );

  }

  stop() {

    clearInterval(
      this.interval
    );

  }

}

const gameLoopRuntime =
  new GameLoopRuntime();

export default
  gameLoopRuntime;