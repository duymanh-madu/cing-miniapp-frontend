import {
  useEffect,
  useState,
} from "react";

import dynamicVoucherRuntime from "@/cms/runtime/dynamicVoucherRuntime";

function VoucherPage() {

  const [
    vouchers,
    setVouchers,
  ] = useState([]);

  useEffect(() => {

    async function load() {

      const response =
        await dynamicVoucherRuntime
          .getMyVouchers();

      setVouchers(
        response
      );

    }

    load();

  }, []);

  return (

    <div
      className="
        min-h-screen
        bg-black
        p-5
        text-white
      "
    >

      <div
        className="
          mb-6
          text-4xl
          font-black
        "
      >
        Voucher Wallet
      </div>

      <div
        className="
          grid
          gap-4
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
                  rounded-3xl
                  bg-zinc-900
                  p-5
                "
              >

                <div
                  className="
                    text-xl
                    font-bold
                  "
                >
                  {
                    voucher.name
                  }
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    opacity-70
                  "
                >
                  {
                    voucher.description
                  }
                </div>

              </div>

            )
          )
        }

      </div>

    </div>

  );

}

export default
  VoucherPage;