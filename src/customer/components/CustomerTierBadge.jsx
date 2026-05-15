import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

function CustomerTierBadge() {

  const tier =
    realtimeCustomerStore(
      (state) =>
        state.tier
    );

  return (

    <div
      className="
        inline-flex
        items-center
        rounded-full
        bg-yellow-500
        px-4
        py-2
        text-xs
        font-bold
        text-black
      "
    >

      {
        tier || "Member"
      }

    </div>

  );

}

export default
  CustomerTierBadge;