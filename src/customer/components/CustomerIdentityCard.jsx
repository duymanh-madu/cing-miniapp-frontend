import useRealtimeCustomerStore
  from "@/stores/realtimeCustomerStore";

/**
 * =====================================================
 * CUSTOMER IDENTITY CARD
 * =====================================================
 */

function CustomerIdentityCard() {

  const profile =
    useRealtimeCustomerStore(
      (
        state
      ) => state.profile
    );

  return (

    <div
      className="
        rounded-3xl
        border
        border-neutral-800
        bg-neutral-950
        p-5
        text-white
        shadow-2xl
      "
    >

      <div
        className="
          text-sm
          text-neutral-400
        "
      >

        Thành viên

      </div>

      <div
        className="
          mt-2
          text-2xl
          font-black
        "
      >

        {
          profile.name
        }

      </div>

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
        "
      >

        <div>

          <div
            className="
              text-xs
              text-neutral-500
            "
          >

            Điểm thưởng

          </div>

          <div
            className="
              text-xl
              font-bold
              text-yellow-400
            "
          >

            {
              profile.points
            }

          </div>

        </div>

        <div>

          <div
            className="
              text-xs
              text-neutral-500
            "
          >

            Hạng thành viên

          </div>

          <div
            className="
              text-xl
              font-bold
              text-orange-400
            "
          >

            {
              profile.tier
            }

          </div>

        </div>

      </div>

    </div>

  );

}

export default
  CustomerIdentityCard;