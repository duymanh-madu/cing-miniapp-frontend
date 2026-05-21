import gamePhysicsRuntime from "./gamePhysicsRuntime";
import realtimeGameStore from "@/stores/realtimeGameStore";

class GameCollisionRuntime {

  update() {

    const obstacles =
      realtimeGameStore
        .getState()
        .obstacles;

    const playerX = 80;

    const playerY =
      gamePhysicsRuntime.playerY;

    for (const obstacle of obstacles) {

      const hitX =
        playerX + 52 > obstacle.x &&
        playerX < obstacle.x + obstacle.width;

      const hitTop =
        playerY < obstacle.gapY;

      const hitBottom =
        playerY + 52 >
        obstacle.gapY + obstacle.gapHeight;

      if (
        hitX &&
        (hitTop || hitBottom)
      ) {

        gamePhysicsRuntime
          .killPlayer();

      }

    }

  }

}

const gameCollisionRuntime =
  new GameCollisionRuntime();

export default gameCollisionRuntime;