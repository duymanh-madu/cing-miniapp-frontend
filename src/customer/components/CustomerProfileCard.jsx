import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

function CustomerProfileCard() {

  const profile =
    realtimeCustomerStore(
      (state) =>
        state.profile
    );

  return (

    <div
      className="
        flex
        items-center
        gap-4
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      "
    >

      <div
        className="
          h-16
          w-16
          overflow-hidden
          rounded-full
          bg-zinc-800
        "
      >

        {
          profile?.avatar && (

            <img
              src={
                profile.avatar
              }
              alt="avatar"
              className="
                h-full
                w-full
                object-cover
              "
            />

          )
        }

      </div>

      <div>

        <div
          className="
            text-xl
            font-bold
          "
        >
          {
            profile?.name ||
            "Customer"
          }
        </div>

        <div
          className="
            mt-1
            text-xs
            opacity-60
          "
        >
          Real-time loyalty member
        </div>

      </div>

    </div>

  );

}

export default
  CustomerProfileCard;