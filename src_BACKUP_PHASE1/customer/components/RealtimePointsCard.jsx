import realtimeCustomerStore from "@/stores/customer";

function RealtimePointsCard() {

  const points =
    realtimeCustomerStore(
      (state) =>
        state.points
    );

  return (

    <div
      className="
        rounded-3xl
        bg-gradient-to-br
        from-green-500
        to-emerald-700
        p-5
        text-white
      "
    >

      <div
        className="
          mb-2
          text-sm
          opacity-80
        "
      >
        Live Points
      </div>

      <div
        className="
          text-4xl
          font-black
        "
      >
        {
          points
        }
      </div>

    </div>

  );

}

export default
  RealtimePointsCard;