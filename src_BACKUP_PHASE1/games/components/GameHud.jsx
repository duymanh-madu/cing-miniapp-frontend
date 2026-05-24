import realtimeGameStore from "@/games/store/gameRuntimeStore";

function GameHud() {

  const score =
    realtimeGameStore(
      (state) =>
        state.score
    );

  const bestScore =
    realtimeGameStore(
      (state) =>
        state.bestScore
    );

  return (

    <div
      className="
        absolute
        left-5
        right-5
        top-5
        z-30
        flex
        items-center
        justify-between
        text-white
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        {
          score
        }
      </div>

      <div
        className="
          rounded-full
          bg-white/10
          px-4
          py-2
          text-xs
          font-bold
        "
      >
        BEST:
        {" "}
        {
          bestScore
        }
      </div>

    </div>

  );

}

export default
  GameHud;