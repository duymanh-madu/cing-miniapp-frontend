import realtimeGameStore from "@/stores/realtimeGameStore";

class GamePhysicsRuntime {

  gravity =
    0.45;

  jumpForce =
    -8;

  velocity =
    0;

  playerY =
    200;

  jump() {

    this.velocity =
      this.jumpForce;

  }

  update() {

    this.velocity +=
      this.gravity;

    this.playerY +=
      this.velocity;

    realtimeGameStore
      .getState()
      .setScore(
        Math.floor(
          realtimeGameStore
            .getState()
            .tick / 10
        )
      );

  }

}

const gamePhysicsRuntime =
  new GamePhysicsRuntime();

export default
  gamePhysicsRuntime;