import gameBackgroundRuntime from "@/game/runtime/gameBackgroundRuntime";

function GameBackground() {

  return (

    <div
      className="
        absolute
        inset-0
        opacity-20
      "
      style={{

        backgroundImage:
          "url('/images/game-bg.png')",

        backgroundRepeat:
          "repeat-x",

        backgroundPositionX:
          `${gameBackgroundRuntime.offset}px`,

      }}
    />

  );

}

export default
  GameBackground;