import {
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import useCartStore from "@/menu/stores/cartStore";

import QuantityStepper from "@/menu/components/QuantityStepper";

/**
 * =====================================================
 * CART DRAWER
 * =====================================================
 */

function CartDrawer() {

  const navigate =
    useNavigate();

  const isCartOpen =
    useCartStore(
      (
        state
      ) =>
        state.isCartOpen
    );

  const closeCart =
    useCartStore(
      (
        state
      ) =>
        state.closeCart
    );

  const items =
    useCartStore(
      (
        state
      ) =>
        state.items
    );

  const totalPrice =
    useCartStore(
      (
        state
      ) =>
        state.getTotalPrice()
    );

  const increaseQuantity =
    useCartStore(
      (
        state
      ) =>
        state.increaseQuantity
    );

  const decreaseQuantity =
    useCartStore(
      (
        state
      ) =>
        state.decreaseQuantity
    );

  /**
   * =====================================================
   * TOTAL ITEMS
   * =====================================================
   */

  const totalItems =
    useMemo(
      () => {

        return items.reduce(
          (
            total,
            item
          ) =>

            total +
            item.quantity,

          0
        );

      },
      [
        items,
      ]
    );

  /**
   * =====================================================
   * EMPTY
   * =====================================================
   */

  if (
    !isCartOpen
  ) {

    return null;

  }

  /**
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (

    <div
      onClick={
        closeCart
      }
      className="
        fixed
        inset-0
        z-[80]

        bg-black/70
        backdrop-blur-md
      "
    >

      <div

        onClick={(
          event
        ) =>
          event.stopPropagation()
        }

        className="
          absolute
          bottom-0
          left-0
          right-0

          flex
          max-h-[92vh]
          flex-col

          overflow-hidden

          rounded-t-[32px]

          border-t
          border-zinc-800

          bg-[#090909]

          shadow-[0_-10px_60px_rgba(0,0,0,0.7)]
        "
      >

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div
          className="
            sticky
            top-0
            z-10

            border-b
            border-zinc-800

            bg-[#090909]/90
            backdrop-blur-xl
          "
        >

          {/* HANDLE */}

          <div
            className="
              flex
              justify-center

              pt-3
            "
          >

            <div
              className="
                h-1.5
                w-16

                rounded-full

                bg-zinc-700
              "
            />

          </div>

          {/* TITLE */}

          <div
            className="
              flex
              items-center
              justify-between

              px-5
              pb-5
              pt-4
            "
          >

            <div>

              <h2
                className="
                  text-3xl
                  font-black

                  text-white
                "
              >

                Giỏ hàng

              </h2>

              <p
                className="
                  mt-1

                  text-sm

                  text-zinc-500
                "
              >

                {
                  totalItems
                }
                {" "}
                sản phẩm

              </p>

            </div>

            <button

              onClick={
                closeCart
              }

              className="
                flex
                h-11
                w-11

                items-center
                justify-center

                rounded-full

                bg-zinc-900

                text-xl
                font-bold

                text-zinc-400

                transition-all

                active:scale-95
              "
            >

              ×

            </button>

          </div>

        </div>

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}

        <div
          className="
            flex-1

            overflow-y-auto

            px-5
            py-5
          "
        >

          {/* EMPTY */}

          {

            items.length === 0 && (

              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center

                  py-24

                  text-center
                "
              >

                <div
                  className="
                    text-7xl
                  "
                >

                  🧋

                </div>

                <h3
                  className="
                    mt-5

                    text-2xl
                    font-black

                    text-white
                  "
                >

                  Giỏ hàng trống

                </h3>

                <p
                  className="
                    mt-2

                    max-w-xs

                    text-sm
                    leading-6

                    text-zinc-500
                  "
                >

                  Hãy chọn món yêu thích
                  của bạn để tiếp tục
                  đặt hàng.

                </p>

              </div>

            )

          }

          {/* ITEMS */}

          <div
            className="
              flex
              flex-col
              gap-4
            "
          >

            {

              items.map(
                (
                  item,
                  index
                ) => (

                  <div

                    key={
                      `${item.id}-${index}`
                    }

                    className="
                      overflow-hidden

                      rounded-[28px]

                      border
                      border-zinc-800

                      bg-zinc-950
                    "
                  >

                    {/* TOP */}

                    <div
                      className="
                        flex
                        gap-4

                        p-4
                      "
                    >

                      {/* IMAGE */}

                      <div
                        className="
                          flex
                          h-24
                          w-24

                          flex-shrink-0
                          items-center
                          justify-center

                          overflow-hidden

                          rounded-2xl

                          border
                          border-zinc-800

                          bg-black
                        "
                      >

                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          className="
                            max-h-full
                            w-auto

                            object-contain
                          "
                        />

                      </div>

                      {/* INFO */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        {/* NAME */}

                        <h3
                          className="
                            line-clamp-2

                            text-lg
                            font-black

                            leading-tight

                            text-white
                          "
                        >

                          {item.name}

                        </h3>

                        {/* TOPPINGS */}

                        {

                          item.toppings?.length > 0 && (

                            <div
                              className="
                                mt-3

                                flex
                                flex-wrap
                                gap-2
                              "
                            >

                              {

                                item.toppings.map(
                                  (
                                    topping
                                  ) => (

                                    <div
                                      key={
                                        topping.id
                                      }
                                      className="
                                        rounded-full

                                        border
                                        border-yellow-500/10

                                        bg-yellow-500/10

                                        px-2.5
                                        py-1

                                        text-[11px]
                                        font-bold

                                        text-yellow-400
                                      "
                                    >

                                      {
                                        topping.name
                                      }

                                    </div>

                                  )
                                )

                              }

                            </div>

                          )

                        }

                        {/* OPTIONS */}

                        <div
                          className="
                            mt-3

                            flex
                            flex-wrap
                            gap-2
                          "
                        >

                          <div
                            className="
                              rounded-full

                              bg-zinc-900

                              px-2.5
                              py-1

                              text-[11px]
                              font-bold

                              text-zinc-300
                            "
                          >

                            Đường:
                            {" "}
                            {item.sugar}

                          </div>

                          <div
                            className="
                              rounded-full

                              bg-zinc-900

                              px-2.5
                              py-1

                              text-[11px]
                              font-bold

                              text-zinc-300
                            "
                          >

                            Đá:
                            {" "}
                            {item.ice}

                          </div>

                        </div>

                        {/* NOTE */}

                        {

                          item.note && (

                            <div
                              className="
                                mt-3

                                rounded-2xl

                                border
                                border-zinc-800

                                bg-black/40

                                p-3

                                text-sm
                                leading-6

                                text-zinc-400
                              "
                            >

                              {
                                item.note
                              }

                            </div>

                          )

                        }

                      </div>

                    </div>

                    {/* FOOTER */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between

                        border-t
                        border-zinc-800

                        px-4
                        py-4
                      "
                    >

                      {/* PRICE */}

                      <div>

                        <p
                          className="
                            text-xs
                            font-medium

                            text-zinc-500
                          "
                        >

                          Thành tiền

                        </p>

                        <div
                          className="
                            mt-1

                            text-2xl
                            font-black

                            tracking-tight

                            text-yellow-400
                          "
                        >

                          {

                            Number(
                              item.finalPrice ||
                              item.price
                            ).toLocaleString()

                          }đ

                        </div>

                      </div>

                      {/* QUANTITY */}

                      <QuantityStepper

                        quantity={
                          item.quantity
                        }

                        onIncrease={() =>
                          increaseQuantity(
                            item.id
                          )
                        }

                        onDecrease={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }

                      />

                    </div>

                  </div>

                )
              )

            }

          </div>

        </div>

        {/* ========================================= */}
        {/* FOOTER */}
        {/* ========================================= */}

        {

          items.length > 0 && (

            <div
              className="
                sticky
                bottom-0

                border-t
                border-zinc-800

                bg-[#090909]/95
                backdrop-blur-xl

                p-5
              "
            >

              {/* TOTAL */}

              <div
                className="
                  mb-5

                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-medium

                      text-zinc-500
                    "
                  >

                    Tổng thanh toán

                  </p>

                  <div
                    className="
                      mt-1

                      text-4xl
                      font-black

                      tracking-tight

                      text-yellow-400
                    "
                  >

                    {
                      totalPrice.toLocaleString()
                    }đ

                  </div>

                </div>

                <div
                  className="
                    rounded-full

                    bg-yellow-500/10

                    px-4
                    py-2

                    text-sm
                    font-bold

                    text-yellow-400
                  "
                >

                    {totalItems}
                    {" "}
                    món

                </div>

              </div>

              {/* BUTTON */}

              <button

                onClick={() => {

                  closeCart();

                  navigate(
                    "/checkout"
                  );

                }}

                className="
                  flex
                  h-16
                  w-full

                  items-center
                  justify-center

                  rounded-2xl

                  bg-yellow-500

                  text-xl
                  font-black

                  text-black

                  shadow-[0_10px_30px_rgba(234,179,8,0.25)]

                  transition-all
                  duration-200

                  hover:scale-[1.01]

                  active:scale-[0.98]
                "
              >

                Tiến hành thanh toán

              </button>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default
  CartDrawer;