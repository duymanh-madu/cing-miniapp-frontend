import realtimeCustomerStore from "@/stores/customer";

function CustomerSpendingCard() {

  const spending =
    realtimeCustomerStore(
      (state) =>
        state.spending
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
        Total Spending
      </div>

      <div
        className="
          text-3xl
          font-black
        "
      >
        {
          spending
            .toLocaleString()
        }
        đ
      </div>

    </div>

  );

}

export default
  CustomerSpendingCard;