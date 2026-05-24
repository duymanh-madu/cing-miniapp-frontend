import realtimeGameStore from "@/games/store/gameRuntimeStore";

import gamePhysicsRuntime from "./gamePhysicsRuntime";

import gameObstacleRuntime from "./gameObstacleRuntime";

import gameCollisionRuntime from "./gameCollisionRuntime";

class GameLoopRuntime {

  frame = null;

  tick = 0;

  running = false;

  start() {

    if (this.running) {

      return;

    }

    this.running = true;

    gameObstacleRuntime.initialize();

    const loop = () => {

      // =====================
      // GLOBAL TICK
      // =====================

      this.tick += 1;

      realtimeGameStore
        .getState()
        .setTick(
          this.tick
        );

      // =====================
      // UPDATE GAME SYSTEMS
      // =====================

      gamePhysicsRuntime
        .update();

      gameObstacleRuntime
        .update();

      gameCollisionRuntime
        .update();

      // =====================
      // NEXT FRAME
      // =====================

      this.frame =
        requestAnimationFrame(
          loop
        );

    };

    loop();

  }

  stop() {

    this.running = false;

    cancelAnimationFrame(
      this.frame
    );

  }

}

const gameLoopRuntime =
  new GameLoopRuntime();

export default
  gameLoopRuntime;