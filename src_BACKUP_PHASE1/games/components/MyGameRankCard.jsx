import realtimeGameStore from "@/games/store/gameRuntimeStore";

function MyGameRankCard() {

  const bestScore =
    realtimeGameStore(
      (state) =>
        state.bestScore
    );

  return (

    <div
      className="
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      "
    >

      <div
        className="
          mb-2
          text-sm
          opacity-70
        "
      >
        Your Best Score
      </div>

      <div
        className="
          text-4xl
          font-black
        "
      >
        {
          bestScore
        }
      </div>

    </div>

  );

}

export default
  MyGameRankCard;