import realtimeGameStore from "@/stores/realtimeGameStore";

function GameComboIndicator() {

  const combo =
    realtimeGameStore(
      (state) =>
        state.combo
    );

  if (
    combo <= 1
  ) {

    return null;

  }

  return (

    <div
      className="
        absolute
        right-5
        top-24
        z-30
        rounded-full
        bg-pink-500
        px-4
        py-2
        text-sm
        font-black
        text-white
        shadow-2xl
      "
    >

      x
      {
        combo
      }
      Combo

    </div>

  );

}

export default
  GameComboIndicator;