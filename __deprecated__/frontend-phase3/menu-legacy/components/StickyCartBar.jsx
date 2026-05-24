import useCartStore from "@/menu/stores/cartStore";

/**
 * =====================================================
 * STICKY CART BAR
 * =====================================================
 */

function StickyCartBar() {

  const totalItems =
    useCartStore(
      (
        state
      ) =>
        state.getTotalItems()
    );

  const totalPrice =
    useCartStore(
      (
        state
      ) =>
        state.getTotalPrice()
    );

  const openCart =
    useCartStore(
      (
        state
      ) =>
        state.openCart
    );

  if (
    totalItems <= 0
  ) {

    return null;

  }

  return (

    <div
      className="
        fixed
        bottom-5
        left-1/2
        z-40

        w-[calc(100%-24px)]
        max-w-xl

        -translate-x-1/2
      "
    >

      <button

        onClick={
          openCart
        }

        className="
          flex
          h-16
          w-full

          items-center
          justify-between

          rounded-3xl

          bg-yellow-500

          px-5

          shadow-2xl

          shadow-yellow-500/20
        "
      >

        <div>

          <p
            className="
              text-sm
              font-bold
              text-black/70
            "
          >

            {totalItems} món

          </p>

          <h3
            className="
              text-2xl
              font-black
              text-black
            "
          >

            {
              totalPrice.toLocaleString()
            }đ

          </h3>

        </div>

        <div
          className="
            text-lg
            font-black
            text-black
          "
        >

          Xem giỏ hàng

        </div>

      </button>

    </div>

  );

}

export default
  StickyCartBar;