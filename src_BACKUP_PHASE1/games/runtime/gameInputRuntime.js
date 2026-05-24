import gamePhysicsRuntime from "./gamePhysicsRuntime";

class GameInputRuntime {

  initialize() {

    window.addEventListener(
      "click",
      () => {

        gamePhysicsRuntime
          .jump();

      }
    );

    window.addEventListener(
      "touchstart",
      () => {

        gamePhysicsRuntime
          .jump();

      }
    );

  }

}

const gameInputRuntime =
  new GameInputRuntime();

export default
  gameInputRuntime;