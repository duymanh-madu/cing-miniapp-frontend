import {
  X,
} from "lucide-react";

function CustomerInfoModal({
  open,
  onClose,
  customer,
  setCustomer,
  onSubmit,
}) {

  if (!open) {
    return null;
  }

  return (

    <div
      className="
        fixed
        inset-0
        z-[999]
        bg-black/70
        backdrop-blur-sm
        flex
        items-end
        justify-center
      "
    >

      <div
        className="
          w-full
          max-w-2xl
          bg-[#101014]
          rounded-t-[32px]
          p-6
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            mb-6
          "
        >

          <h2
            className="
              text-white
              text-2xl
              font-black
            "
          >
            Thông tin khách hàng
          </h2>

          <button
            onClick={onClose}
            className="
              w-10
              h-10
              rounded-full
              bg-white/10
              text-white
              flex
              items-center
              justify-center
            "
          >

            <X size={20} />

          </button>

        </div>

        {/* INPUTS */}

        <div
          className="
            space-y-4
          "
        >

          <input
            value={customer.name}
            onChange={(e) =>
              setCustomer({
                ...customer,
                name:
                  e.target.value,
              })
            }
            placeholder="Tên khách hàng"
            className="
              w-full
              h-14
              rounded-2xl
              bg-black
              border
              border-white/10
              px-4
              text-white
              outline-none
            "
          />

          <input
            value={customer.phone}
            onChange={(e) =>
              setCustomer({
                ...customer,
                phone:
                  e.target.value,
              })
            }
            placeholder="Số điện thoại"
            className="
              w-full
              h-14
              rounded-2xl
              bg-black
              border
              border-white/10
              px-4
              text-white
              outline-none
            "
          />

          <textarea
            value={customer.note}
            onChange={(e) =>
              setCustomer({
                ...customer,
                note:
                  e.target.value,
              })
            }
            placeholder="Ghi chú đơn hàng"
            className="
              w-full
              rounded-2xl
              bg-black
              border
              border-white/10
              p-4
              text-white
              outline-none
              min-h-[120px]
            "
          />

        </div>

        {/* BUTTON */}

        <button
          onClick={onSubmit}
          className="
            w-full
            h-14
            rounded-2xl
            bg-yellow-400
            text-black
            font-black
            text-lg
            mt-6
          "
        >
          Xác nhận thanh toán
        </button>

      </div>

    </div>

  );

}

export default
  CustomerInfoModal;