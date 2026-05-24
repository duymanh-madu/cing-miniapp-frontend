import realtimeCustomerStore from "@/stores/customer";

function CustomerVoucherPreview() {

  const vouchers =
    realtimeCustomerStore(
      (state) =>
        state.vouchers
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
          mb-4
          text-lg
          font-bold
        "
      >
        Voucher Wallet
      </div>

      <div
        className="
          grid
          gap-3
        "
      >

        {
          vouchers.map(
            (
              voucher
            ) => (

              <div
                key={
                  voucher.id
                }
                className="
                  rounded-2xl
                  bg-zinc-800
                  p-4
                "
              >

                {
                  voucher.name
                }

              </div>

            )
          )
        }

      </div>

    </div>

  );

}

export default
  CustomerVoucherPreview;