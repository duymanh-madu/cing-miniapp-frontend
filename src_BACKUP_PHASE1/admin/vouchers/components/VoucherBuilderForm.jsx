import {
  useState,
} from "react";

import voucherService from "../voucherService";

function VoucherBuilderForm() {

  const [
    code,
    setCode,
  ] = useState("");

  const [
    discount,
    setDiscount,
  ] = useState("");

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    await voucherService
      .createVoucher({

        code,

        discount,

      });

  }

  return (

    <form
      onSubmit={
        handleSubmit
      }

      className="
        space-y-4
        rounded-3xl
        bg-white/5
        p-5
      "
    >

      <input
        value={code}
        onChange={(event) =>
          setCode(
            event.target.value
          )
        }
        placeholder="Voucher Code"
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <input
        value={discount}
        onChange={(event) =>
          setDiscount(
            event.target.value
          )
        }
        placeholder="Discount Value"
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <button
        type="submit"
        className="
          rounded-2xl
          bg-white
          px-5
          py-3
          font-bold
          text-black
        "
      >
        Create Voucher
      </button>

    </form>

  );

}

export default
  VoucherBuilderForm;