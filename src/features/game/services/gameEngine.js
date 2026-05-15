import gameStore from "@/features/game/store/gameStore";

class GameEngine {

  start() {

    gameStore
      .getState()
      .setPlaying(true);

  }

  finish(score) {

    gameStore
      .getState()
      .finish(score);

  }

}

const gameEngine =
  new GameEngine();

export default
  gameEngine;