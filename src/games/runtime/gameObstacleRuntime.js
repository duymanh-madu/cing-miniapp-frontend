import realtimeGameStore from "@/stores/realtimeGameStore";

class GameObstacleRuntime {

  obstacles = [];

  baseSpawnDelay = 95;

  tick = 0;

  speed = 3.5;

  initialize() {

    this.obstacles = [];

    this.tick = 0;

  }

  generate() {

    const score =

      realtimeGameStore

        .getState()

        .score;

    // =========================

    // DYNAMIC GAP

    // =========================

    const gapHeight =

      score < 10

        ? 240

        : score < 20

        ? 215

        : score < 35

        ? 190

        : score < 50

        ? 170

        : 155;

    // =========================

    // PIPE WIDTH

    // =========================

    const width =

      score < 20

        ? 72

        : 78;

    // =========================

    // SAFE ZONE EARLY GAME

    // =========================

    const minGapY = 90;

    const maxGapY =

      600 -

      gapHeight -

      90;

    const gapY =

      Math.floor(

        Math.random() *

        (

          maxGapY -

          minGapY

        )

      ) + minGapY;

    // =========================

    // ADD PIPE

    // =========================

    this.obstacles.push({

      id:

        crypto.randomUUID(),

      x:

        520,

      gapY,

      width,

      gapHeight,

      scored:

        false,

      glow:

        false,

    });

  }

  update() {

    const score =

      realtimeGameStore

        .getState()

        .score;

    // =========================

    // SPEED CURVE

    // =========================

    this.speed =

      score < 10

        ? 3.4

        : score < 20

        ? 4.1

        : score < 35

        ? 4.9

        : score < 50

        ? 5.7

        : 6.4;

    // =========================

    // PIPE SPAWN RATE

    // =========================

    const spawnDelay =

      score < 10

        ? 120

        : score < 20

        ? 105

        : score < 35

        ? 92

        : 84;

    this.tick += 1;

    // =========================

    // GENERATE NEW PIPE

    // =========================

    if (

      this.tick %

      spawnDelay ===

      0

    ) {

      this.generate();

    }

    // =========================

    // UPDATE PIPE POSITIONS

    // =========================

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

    // =========================

    // REMOVE OFFSCREEN

    // =========================

    this.obstacles =

      this.obstacles.filter(

        (

          obstacle

        ) =>

          obstacle.x >

          -160

      );

    // =========================

    // UPDATE STORE

    // =========================

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