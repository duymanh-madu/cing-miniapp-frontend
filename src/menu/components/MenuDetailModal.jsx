import {
  useState,
} from "react";

import useMenuStore from "@/menu/stores/menuStore";

import useCartStore from "@/menu/stores/cartStore";

/**
 * =====================================================
 * TOPPINGS
 * =====================================================
 */

const TOPPINGS = [

  {
    id: 1,
    name: "Trân châu đen",
    price: 10000,
  },

  {
    id: 2,
    name: "Kem cheese",
    price: 15000,
  },

  {
    id: 3,
    name: "Thạch cafe",
    price: 8000,
  },

];

/**
 * =====================================================
 * OPTIONS
 * =====================================================
 */

const SUGAR_OPTIONS = [
  "0%",
  "30%",
  "50%",
  "70%",
  "100%",
];

const ICE_OPTIONS = [
  "0%",
  "30%",
  "50%",
  "70%",
  "100%",
];

/**
 * =====================================================
 * MENU DETAIL MODAL
 * =====================================================
 */

function MenuDetailModal() {

  const selectedItem =
    useMenuStore(
      (
        state
      ) =>
        state.selectedItem
    );

  const setSelectedItem =
    useMenuStore(
      (
        state
      ) =>
        state.setSelectedItem
    );

  const addItem =
    useCartStore(
      (
        state
      ) =>
        state.addItem
    );

  /**
   * =====================================================
   * LOCAL STATE
   * =====================================================
   */

  const [
    selectedToppings,
    setSelectedToppings,
  ] = useState([]);

  const [
    sugar,
    setSugar,
  ] = useState(
    "100%"
  );

  const [
    ice,
    setIce,
  ] = useState(
    "100%"
  );

  const [
    note,
    setNote,
  ] = useState("");

  /**
   * =====================================================
   * CLOSE
   * =====================================================
   */

  if (
    !selectedItem
  ) {

    return null;

  }

  /**
   * =====================================================
   * TOPPING TOGGLE
   * =====================================================
   */

  const toggleTopping =
    (
      topping
    ) => {

      const exists =
        selectedToppings.find(
          (
            item
          ) =>
            item.id ===
            topping.id
        );

      if (
        exists
      ) {

        setSelectedToppings(

          selectedToppings.filter(
            (
              item
            ) =>
              item.id !==
              topping.id
          )

        );

      } else {

        setSelectedToppings([

          ...selectedToppings,

          topping,

        ]);

      }

    };

  /**
   * =====================================================
   * FINAL PRICE
   * =====================================================
   */

  const toppingsPrice =
    selectedToppings.reduce(
      (
        total,
        topping
      ) => {

        return (
          total +
          topping.price
        );

      },
      0
    );

  const finalPrice =
    Number(
      selectedItem.price || 0
    ) +
    toppingsPrice;

  /**
   * =====================================================
   * ADD TO CART
   * =====================================================
   */

  const handleAddToCart =
    () => {

      addItem({

        ...selectedItem,

        toppings:
          selectedToppings,

        sugar,

        ice,

        note,

        finalPrice,

      });

      setSelectedItem(
        null
      );

    };

  return (

    <div

      onClick={() =>
        setSelectedItem(
          null
        )
      }

      className="
        fixed
        inset-0
        z-50

        flex
        items-end

        bg-black/70
        backdrop-blur-md
      "
    >

      <div

        onClick={(
          e
        ) =>
          e.stopPropagation()
        }

        className="
          relative

          w-full

          rounded-t-[32px]

          bg-[#090909]

          p-5

          shadow-2xl

          animate-in
          slide-in-from-bottom
          duration-300
        "
      >

        {/* HANDLE */}

        <div
          className="
            mb-4
            flex
            justify-center
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

        {/* IMAGE */}

        <div
          className="
            flex
            justify-center

            overflow-hidden

            rounded-3xl

            border
            border-zinc-800

            bg-black

            py-6
          "
        >

          <img
            src={
              selectedItem.image
            }
            alt={
              selectedItem.name
            }
            className="
              h-[180px]
              w-auto

              object-contain
            "
          />

        </div>

        {/* CONTENT */}

        <div
          className="
            mt-5
          "
        >

          <div
            className="
              inline-flex

              rounded-full

              bg-yellow-500/10

              px-3
              py-1

              text-xs
              font-bold

              text-yellow-400
            "
          >

            {
              selectedItem.category
            }

          </div>

          <h2
            className="
              mt-4

              text-3xl
              font-black

              text-white
            "
          >

            {
              selectedItem.name
            }

          </h2>

          <p
            className="
              mt-2

              text-zinc-400
            "
          >

            {
              selectedItem.description ||
              "Signature drink tại Cing Hu Tang"
            }

          </p>

          {/* TOPPINGS */}

          <div
            className="
              mt-6
            "
          >

            <h3
              className="
                mb-3

                text-lg
                font-bold

                text-white
              "
            >

              Topping

            </h3>

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >

              {

                TOPPINGS.map(
                  (
                    topping
                  ) => {

                    const active =
                      selectedToppings.find(
                        (
                          item
                        ) =>
                          item.id ===
                          topping.id
                      );

                    return (

                      <button

                        key={
                          topping.id
                        }

                        onClick={() =>
                          toggleTopping(
                            topping
                          )
                        }

                        className={`
                          rounded-2xl

                          border

                          px-4
                          py-3

                          text-sm
                          font-bold

                          transition-all

                          ${
                            active

                              ? `
                                border-yellow-500
                                bg-yellow-500/10
                                text-yellow-400
                              `

                              : `
                                border-zinc-800
                                bg-zinc-900
                                text-zinc-300
                              `
                          }
                        `}
                      >

                        {
                          topping.name
                        }

                        {" · "}

                        +
                        {
                          topping.price.toLocaleString()
                        }đ

                      </button>

                    );

                  }
                )

              }

            </div>

          </div>

          {/* SUGAR */}

          <div
            className="
              mt-6
            "
          >

            <h3
              className="
                mb-3

                text-lg
                font-bold

                text-white
              "
            >

              Đường

            </h3>

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {

                SUGAR_OPTIONS.map(
                  (
                    value
                  ) => (

                    <button

                      key={
                        value
                      }

                      onClick={() =>
                        setSugar(
                          value
                        )
                      }

                      className={`
                        rounded-full

                        px-4
                        py-2

                        text-sm
                        font-bold

                        ${
                          sugar ===
                          value

                            ? `
                              bg-yellow-500
                              text-black
                            `

                            : `
                              bg-zinc-900
                              text-white
                            `
                        }
                      `}
                    >

                      {value}

                    </button>

                  )
                )

              }

            </div>

          </div>

          {/* ICE */}

          <div
            className="
              mt-6
            "
          >

            <h3
              className="
                mb-3

                text-lg
                font-bold

                text-white
              "
            >

              Đá

            </h3>

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {

                ICE_OPTIONS.map(
                  (
                    value
                  ) => (

                    <button

                      key={
                        value
                      }

                      onClick={() =>
                        setIce(
                          value
                        )
                      }

                      className={`
                        rounded-full

                        px-4
                        py-2

                        text-sm
                        font-bold

                        ${
                          ice ===
                          value

                            ? `
                              bg-yellow-500
                              text-black
                            `

                            : `
                              bg-zinc-900
                              text-white
                            `
                        }
                      `}
                    >

                      {value}

                    </button>

                  )
                )

              }

            </div>

          </div>

          {/* NOTE */}

          <div
            className="
              mt-6
            "
          >

            <textarea

              value={
                note
              }

              onChange={(
                e
              ) =>
                setNote(
                  e.target.value
                )
              }

              placeholder="
Ghi chú cho cửa hàng...
"

              className="
                h-28
                w-full

                rounded-3xl

                border
                border-zinc-800

                bg-zinc-950

                p-4

                text-white

                outline-none
              "
            />

          </div>

          {/* PRICE */}

          <div
            className="
              mt-6

              flex
              items-center
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-zinc-500
                "
              >

                Tổng thanh toán

              </p>

              <h3
                className="
                  text-4xl
                  font-black

                  text-yellow-400
                "
              >

                {
                  finalPrice.toLocaleString()
                }đ

              </h3>

            </div>

          </div>

          {/* BUTTON */}

          <button

            onClick={
              handleAddToCart
            }

            className="
              mt-6

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

              active:scale-[0.98]
            "
          >

            Thêm vào giỏ hàng

          </button>

        </div>

      </div>

    </div>

  );

}

export default
  MenuDetailModal;