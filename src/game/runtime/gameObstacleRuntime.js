import realtimeGameStore from "@/stores/realtimeGameStore";

class GameObstacleRuntime {

  obstacles =
    [];

  speed =
    3;

  initialize() {

    this.obstacles =
      [];

  }

  generate() {

    this.obstacles.push({

      id:
        crypto.randomUUID(),

      x:
        window.innerWidth,

      gapY:
        Math.floor(
          Math.random() * 220
        ) + 80,

      width:
        70,

      gapHeight:
        170,

    });

  }

  update() {

    this.obstacles =
      this.obstacles.map(
        (
          obstacle
        ) => ({

          ...obstacle,

          x:
            obstacle.x -
            this.speed,

        })
      );

    this.obstacles =
      this.obstacles.filter(
        (
          obstacle
        ) =>
          obstacle.x > -100
      );

    realtimeGameStore
      .getState()
      .setObstacles(
        this.obstacles
      );

  }

}

const gameObstacleRuntime =
  new GameObstacleRuntime();

export default
  gameObstacleRuntime;