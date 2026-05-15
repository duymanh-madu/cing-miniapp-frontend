import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

function CustomerWalletCard() {

  const points =
    realtimeCustomerStore(
      (state) =>
        state.points
    );

  const tier =
    realtimeCustomerStore(
      (state) =>
        state.tier
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
        Loyalty Wallet
      </div>

      <div
        className="
          text-3xl
          font-black
        "
      >
        {points}
      </div>

      <div
        className="
          mt-2
          text-xs
          opacity-60
        "
      >
        Tier:
        {" "}
        {tier || "Member"}
      </div>

    </div>

  );

}

export default
  CustomerWalletCard;