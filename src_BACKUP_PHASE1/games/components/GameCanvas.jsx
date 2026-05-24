import {
  useEffect,
} from "react";

import realtimeGameStore from "@/games/store/gameRuntimeStore";

import gameInputRuntime from "@/game/runtime/gameInputRuntime";

import gameLoopRuntime from "@/game/runtime/gameLoopRuntime";

import gameAudioRuntime from "@/game/runtime/gameAudioRuntime";

import GameObstacleLayer from "./GameObstacleLayer";

import GameHud from "./GameHud";

import GameBackground from "./GameBackground";

import GameComboIndicator from "./GameComboIndicator";

function GameCanvas() {

  // =========================
  // ZUSTAND STORE
  // =========================

  const playerY =
    realtimeGameStore(
      (state) =>
        state.playerY
    );

  const rotation =
    realtimeGameStore(
      (state) =>
        state.rotation
    );

  const isDead =
    realtimeGameStore(
      (state) =>
        state.isDead
    );

  const tick =
    realtimeGameStore(
      (state) =>
        state.tick
    );

  const flash =
    realtimeGameStore(
      (state) =>
        state.flash
    );

  // =========================
  // INIT
  // =========================

  useEffect(() => {

    gameAudioRuntime.preload();

    gameInputRuntime.initialize();

    gameLoopRuntime.start();

    return () => {

  gameLoopRuntime.stop();

};

  }, []);

  // =========================
  // ANIMATION
  // =========================

  const wingFloat =
    Math.sin(
      tick * 0.015
    ) * 5;

  const bodyFloat =
    Math.sin(
      tick * 0.006
    ) * 2;

  // =========================
  // PLAYER FACE
  // =========================

  const renderFace =
    () => {

      // DEAD FACE

      if (isDead) {

        return (

          <>

            {/* DEAD EYES */}

            <div
              className="
                absolute
                left-[10px]
                top-[18px]
                text-white
                text-[16px]
                font-black
              "
            >
              ×
            </div>

            <div
              className="
                absolute
                right-[10px]
                top-[18px]
                text-white
                text-[16px]
                font-black
              "
            >
              ×
            </div>

            {/* TEARS */}

            <div
              className="
                absolute
                left-[13px]
                top-[32px]
                h-5
                w-2
                rounded-full
                bg-sky-300
              "
            />

            <div
              className="
                absolute
                right-[13px]
                top-[32px]
                h-5
                w-2
                rounded-full
                bg-sky-300
              "
            />

            {/* SAD MOUTH */}

            <div
              className="
                absolute
                left-1/2
                top-[42px]
                h-2
                w-5
                -translate-x-1/2
                rounded-t-full
                border-t-[3px]
                border-[#ffd5cb]
              "
            />

          </>

        );

      }

      // HAPPY FACE

      return (

        <>

          {/* EYES */}

          <div
            className="
              absolute
              left-[10px]
              top-[18px]
              h-4
              w-4
              rounded-full
              bg-white
            "
          >

            <div
              className="
                absolute
                left-[4px]
                top-[4px]
                h-2
                w-2
                rounded-full
                bg-black
              "
            />

          </div>

          <div
            className="
              absolute
              right-[10px]
              top-[18px]
              h-4
              w-4
              rounded-full
              bg-white
            "
          >

            <div
              className="
                absolute
                left-[4px]
                top-[4px]
                h-2
                w-2
                rounded-full
                bg-black
              "
            />

          </div>

          {/* SMILE */}

          <div
            className="
              absolute
              left-1/2
              top-[38px]
              h-3
              w-6
              -translate-x-1/2
              rounded-b-full
              border-b-[4px]
              border-[#ffd5cb]
            "
          />

          {/* CHEEKS */}

          <div
            className="
              absolute
              left-[8px]
              top-[34px]
              h-3
              w-3
              rounded-full
              bg-pink-300/70
            "
          />

          <div
            className="
              absolute
              right-[8px]
              top-[34px]
              h-3
              w-3
              rounded-full
              bg-pink-300/70
            "
          />

        </>

      );

    };

  return (

    <div
      className="
        relative
        h-[var(--app-height)]
        overflow-hidden
        rounded-[40px]
        bg-[#f5ede2]
      "
    >

      {/* FLASH EFFECT */}

      {

        flash && (

          <div
            className="
              absolute
              inset-0
              z-50
              bg-white/40
            "
          />

        )

      }

      <GameBackground />

      <GameHud />

      <GameComboIndicator />

      <GameObstacleLayer />

      {/* PLAYER */}

      <div
        className="
          absolute
          left-16
          z-30
        "
        style={{

          top:
            playerY +
            bodyFloat,

          transform:

            `rotate(${rotation}deg)`,

        }}
      >

        {/* SHADOW */}

        <div
          className="
            absolute
            left-1/2
            top-[68px]
            h-4
            w-14
            -translate-x-1/2
            rounded-full
            bg-black/20
            blur-sm
          "
        />

        {/* BACK WINGS */}

        <div
          className="
            absolute
            -left-5
            top-1
            z-0
            h-12
            w-8
            rounded-full
            border
            border-white/60
            bg-white/70
            blur-[0.3px]
          "
          style={{

            transform:

              `

                rotate(-40deg)

                translateY(${wingFloat}px)

              `,

          }}
        />

        <div
          className="
            absolute
            -right-5
            top-1
            z-0
            h-12
            w-8
            rounded-full
            border
            border-white/60
            bg-white/70
            blur-[0.3px]
          "
          style={{

            transform:

              `

                rotate(40deg)

                translateY(${-wingFloat}px)

              `,

          }}
        />

        {/* BODY */}

        <div
          className="
            relative
            z-10
            h-16
            w-16
            rounded-full
            bg-gradient-to-br
            from-[#2c130d]
            via-[#140707]
            to-black
            shadow-[0_15px_40px_rgba(0,0,0,0.45)]
          "
        >

          {/* GLOSS */}

          <div
            className="
              absolute
              left-2
              top-2
              h-5
              w-5
              rounded-full
              bg-white/20
            "
          />

          {renderFace()}

        </div>

      </div>

    </div>

  );

}

export default GameCanvas;