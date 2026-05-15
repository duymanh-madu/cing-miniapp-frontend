import {
  useEffect,
} from "react";

import gameInputRuntime from "@/game/runtime/gameInputRuntime";

import gameLoopRuntime from "@/game/runtime/gameLoopRuntime";

import gamePhysicsRuntime from "@/game/runtime/gamePhysicsRuntime";

import gameAudioRuntime from "@/game/runtime/gameAudioRuntime";

import GameObstacleLayer from "./GameObstacleLayer";

import GameHud from "./GameHud";

import GameBackground from "./GameBackground";

import GameComboIndicator from "./GameComboIndicator";

function GameCanvas() {

  useEffect(() => {

    gameAudioRuntime
      .preload();

    gameInputRuntime
      .initialize();

    gameLoopRuntime
      .start();

    return () => {

      gameLoopRuntime
        .stop();

    };

  }, []);

  return (

    <div
      className="
        relative
        h-[600px]
        overflow-hidden
        rounded-3xl
        bg-gradient-to-b
        from-sky-400
        to-sky-700
      "
    >

      <GameBackground />

      <GameHud />

      <GameComboIndicator />

      <GameObstacleLayer />

      <div
        className="
          absolute
          left-16
          z-20
          h-14
          w-14
          rounded-full
          bg-yellow-400
          shadow-2xl
        "
        style={{
          top:
            gamePhysicsRuntime
              .playerY,
        }}
      />

    </div>

  );

}

export default
  GameCanvas;