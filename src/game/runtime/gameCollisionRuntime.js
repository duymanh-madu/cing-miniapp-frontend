import realtimeGameStore from "@/stores/realtimeGameStore";

import gamePhysicsRuntime from "./gamePhysicsRuntime";

class GameCollisionRuntime {

  check() {

    const playerY =
      gamePhysicsRuntime
        .playerY;

    const obstacles =
      realtimeGameStore
        .getState()
        .obstacles;

    for (
      const obstacle
      of obstacles
    ) {

      const hitX =
        obstacle.x < 100 &&
        obstacle.x > 20;

      const hitTop =
        playerY <
        obstacle.gapY;

      const hitBottom =
        playerY >
        obstacle.gapY +
        obstacle.gapHeight;

      if (

        hitX &&
        (
          hitTop ||
          hitBottom
        )

      ) {

        return true;

      }

    }

    return false;

  }

}

const gameCollisionRuntime =
  new GameCollisionRuntime();

export default
  gameCollisionRuntime;