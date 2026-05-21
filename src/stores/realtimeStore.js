import { create } from "zustand";

const realtimeGameStore = create(

  (set, get) => ({

    // =========================
    // GAME STATE
    // =========================

    tick: 0,

    score: 0,

    combo: 0,

    bestCombo: 0,

    isDead: false,

    gameStarted: false,

    gameOver: false,

    // =========================
    // PLAYER
    // =========================

    playerY: 260,

    velocity: 0,

    rotation: 0,

    // =========================
    // OBSTACLES
    // =========================

    obstacles: [],

    obstacleSpeed: 3,

    obstacleGap: 240,

    // =========================
    // FX
    // =========================

    shake:

      false,

    flash:

      false,

    // =========================
    // SETTERS
    // =========================

    setTick: (

      tick

    ) =>

      set({

        tick,

      }),

    setScore: (

      score

    ) =>

      set({

        score,

      }),

    setCombo: (

      combo

    ) =>

      set({

        combo,

        bestCombo:

          Math.max(

            combo,

            get()
              .bestCombo

          ),

      }),

    setDead: (

      dead

    ) =>

      set({

        isDead:

          dead,

        gameOver:

          dead,

      }),

    setGameStarted: (

      started

    ) =>

      set({

        gameStarted:

          started,

      }),

    setPlayerY: (

      playerY

    ) =>

      set({

        playerY,

      }),

    setVelocity: (

      velocity

    ) =>

      set({

        velocity,

      }),

    setRotation: (

      rotation

    ) =>

      set({

        rotation,

      }),

    setObstacles: (

      obstacles

    ) =>

      set({

        obstacles,

      }),

    setObstacleSpeed: (

      obstacleSpeed

    ) =>

      set({

        obstacleSpeed,

      }),

    setObstacleGap: (

      obstacleGap

    ) =>

      set({

        obstacleGap,

      }),

    triggerShake: () => {

      set({

        shake:

          true,

      });

      setTimeout(

        () => {

          set({

            shake:

              false,

          });

        },

        300

      );

    },

    triggerFlash: () => {

      set({

        flash:

          true,

      });

      setTimeout(

        () => {

          set({

            flash:

              false,

          });

        },

        180

      );

    },

    // =========================
    // RESET
    // =========================

    resetGame: () =>

      set({

        tick: 0,

        score: 0,

        combo: 0,

        isDead: false,

        gameOver: false,

        playerY: 260,

        velocity: 0,

        rotation: 0,

        obstacles: [],

        obstacleSpeed: 3,

        obstacleGap: 240,

      }),

  })

);

export default realtimeGameStore;