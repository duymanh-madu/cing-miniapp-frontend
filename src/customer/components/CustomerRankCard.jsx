import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

function CustomerRankCard() {

  const rank =
    realtimeCustomerStore(
      (state) =>
        state.rank
    );

  return (

    <div
      className="
        rounded-3xl
        bg-gradient-to-br
        from-yellow-500
        to-orange-600
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
        Your Rank
      </div>

      <div
        className="
          text-4xl
          font-black
        "
      >
        #
        {
          rank || "--"
        }
      </div>

    </div>

  );

}

export default
  CustomerRankCard;