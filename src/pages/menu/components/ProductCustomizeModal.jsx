import {
  useMemo,
  useState,
} from "react";

import {
  X,
  Plus,
  Minus,
  Check,
} from "lucide-react";

const sugarLevels = [
  "100%",
  "70%",
  "50%",
  "30%",
  "0%",
];

const iceLevels = [
  "100%",
  "70%",
  "50%",
  "30%",
  "0%",
];

const toppings = [
  {
    id: 1,
    name: "Trân châu đen",
    price: 10000,
  },
  {
    id: 2,
    name: "Trân châu trắng tròn",
    price: 10000,
  },
  {
    id: 3,
    name: "Trân châu sợi dừa",
    price: 10000,
  },
  {
    id: 4,
    name: "Dừa nướng",
    price: 10000,
  },
  {
    id: 5,
    name: "Hạt năng nổ",
    price: 10000,
  },
  {
    id: 6,
    name: "Thạch ô long",
    price: 10000,
  },
  {
    id: 7,
    name: "Thạch nho",
    price: 10000,
  },
  {
    id: 8,
    name: "Hạt sen",
    price: 10000,
  },
  {
    id: 9,
    name: "Kem cheese",
    price: 10000,
  },
  {
    id: 10,
    name: "Kem trứng",
    price: 10000,
  },
  {
    id: 11,
    name: "Kem mặn",
    price: 10000,
  },
  {
    id: 12,
    name: "Pudding trứng",
    price: 10000,
  },
];

function ProductCustomizeModal({
  item,
  onClose,
  onAddToCart,
}) {

  /**
   * =========================================
   * EARLY RETURN
   * =========================================
   */

  if (!item) {
    return null;
  }

  /**
   * =========================================
   * STATE
   * =========================================
   */

  const [
    sugarLevel,
    setSugarLevel,
  ] = useState("100%");

  const [
    iceLevel,
    setIceLevel,
  ] = useState("100%");

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    selectedToppings,
    setSelectedToppings,
  ] = useState([]);

  /**
   * =========================================
   * PRICE
   * =========================================
   */

  const basePrice =
    Number(
      item.price ||
      item.sale_price ||
      0
    );

  const toppingPrice =
    useMemo(() => {

      return selectedToppings.reduce(
        (
          total,
          topping
        ) =>
          total +
          topping.price,
        0
      );

    }, [selectedToppings]);

  const totalPrice =
    (
      basePrice +
      toppingPrice
    ) * quantity;

  /**
   * =========================================
   * TOGGLE TOPPING
   * =========================================
   */

  function toggleTopping(
    topping
  ) {

    const exists =
      selectedToppings.find(
        (item) =>
          item.id ===
          topping.id
      );

    if (exists) {

      setSelectedToppings(
        selectedToppings.filter(
          (item) =>
            item.id !==
            topping.id
        )
      );

      return;

    }

    setSelectedToppings([
      ...selectedToppings,
      topping,
    ]);

  }

  /**
   * =========================================
   * SUBMIT
   * =========================================
   */

  function handleSubmit() {

    onAddToCart({

      ...item,

      quantity,

      sugarLevel,

      iceLevel,

      toppings:
        selectedToppings,

      totalPrice,

    });

    onClose();

  }

  /**
   * =========================================
   * UI
   * =========================================
   */

  return (

    <div
      className="
        fixed
        inset-0
        z-[999]
        bg-black/70
        backdrop-blur-md
        flex
        items-end
        justify-center
      "
    >

      <div
        className="
          w-full
          max-w-2xl
          bg-[#0f0f18]
          rounded-t-[32px]
          max-h-[92vh]
          overflow-y-auto
          border-t
          border-white/10
          animate-slideUp
        "
      >

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div
          className="
            sticky
            top-0
            z-10
            bg-[#0f0f18]
            px-6
            pt-6
            pb-5
            border-b
            border-white/5
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >

            <div>

              <h2
                className="
                  text-white
                  text-2xl
                  font-black
                  leading-tight
                "
              >
                {item.name}
              </h2>

              <div
                className="
                  mt-3
                  text-yellow-400
                  text-4xl
                  font-black
                "
              >
                {basePrice.toLocaleString()}đ
              </div>

            </div>

            <button
              onClick={onClose}
              className="
                w-11
                h-11
                rounded-full
                bg-white/10
                text-white
                flex
                items-center
                justify-center
                flex-shrink-0
              "
            >

              <X size={20} />

            </button>

          </div>

        </div>

        {/* ================================= */}
        {/* BODY */}
        {/* ================================= */}

        <div
          className="
            px-6
            py-6
          "
        >

          {/* SUGAR */}

          <div className="mb-8">

            <h3
              className="
                text-white
                font-bold
                text-lg
                mb-4
              "
            >
              Chọn lượng đường
            </h3>

            <div
              className="
                flex
                gap-3
                flex-wrap
              "
            >

              {sugarLevels.map(
                (level) => (

                  <button
                    key={level}
                    onClick={() =>
                      setSugarLevel(
                        level
                      )
                    }
                    className={`
                      px-5
                      py-3
                      rounded-2xl
                      font-semibold
                      transition-all
                      ${
                        sugarLevel ===
                        level
                          ? `
                            bg-yellow-400
                            text-black
                          `
                          : `
                            bg-white/10
                            text-white
                          `
                      }
                    `}
                  >
                    {level}
                  </button>

                )
              )}

            </div>

          </div>

          {/* ICE */}

          <div className="mb-8">

            <h3
              className="
                text-white
                font-bold
                text-lg
                mb-4
              "
            >
              Chọn lượng đá
            </h3>

            <div
              className="
                flex
                gap-3
                flex-wrap
              "
            >

              {iceLevels.map(
                (level) => (

                  <button
                    key={level}
                    onClick={() =>
                      setIceLevel(
                        level
                      )
                    }
                    className={`
                      px-5
                      py-3
                      rounded-2xl
                      font-semibold
                      transition-all
                      ${
                        iceLevel ===
                        level
                          ? `
                            bg-yellow-400
                            text-black
                          `
                          : `
                            bg-white/10
                            text-white
                          `
                      }
                    `}
                  >
                    {level}
                  </button>

                )
              )}

            </div>

          </div>

          {/* TOPPING */}

          <div className="mb-8">

            <h3
              className="
                text-white
                font-bold
                text-lg
                mb-4
              "
            >
              Chọn topping
            </h3>

            <div
              className="
                space-y-3
              "
            >

              {toppings.map(
                (topping) => {

                  const active =
                    selectedToppings.find(
                      (item) =>
                        item.id ===
                        topping.id
                    );

                  return (

                    <button
                      key={topping.id}
                      onClick={() =>
                        toggleTopping(
                          topping
                        )
                      }
                      className={`
                        w-full
                        rounded-2xl
                        p-4
                        flex
                        items-center
                        justify-between
                        transition-all
                        border
                        ${
                          active
                            ? `
                              bg-yellow-400/15
                              border-yellow-400
                            `
                            : `
                              bg-white/5
                              border-white/5
                            `
                        }
                      `}
                    >

                      <div
                        className="
                          text-left
                        "
                      >

                        <div
                          className="
                            text-white
                            font-bold
                            text-lg
                          "
                        >
                          {topping.name}
                        </div>

                        <div
                          className="
                            text-yellow-400
                            text-sm
                            mt-1
                          "
                        >
                          +{topping.price.toLocaleString()}đ
                        </div>

                      </div>

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          transition-all
                          ${
                            active
                              ? `
                                bg-yellow-400
                                text-black
                              `
                              : `
                                bg-white/10
                                text-white
                              `
                          }
                        `}
                      >

                        {active
                          ? (
                            <Check
                              size={18}
                            />
                          )
                          : (
                            <Plus
                              size={18}
                            />
                          )}

                      </div>

                    </button>

                  );

                }
              )}

            </div>

          </div>

          {/* QUANTITY */}

          <div
            className="
              flex
              items-center
              justify-between
              mb-10
            "
          >

            <div>

              <div
                className="
                  text-white
                  font-bold
                  text-lg
                "
              >
                Số lượng
              </div>

              <div
                className="
                  text-zinc-400
                  text-sm
                  mt-1
                "
              >
                Điều chỉnh số ly
              </div>

            </div>

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <button
                onClick={() =>
                  setQuantity(
                    Math.max(
                      1,
                      quantity - 1
                    )
                  )
                }
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-white/10
                  text-white
                  flex
                  items-center
                  justify-center
                "
              >

                <Minus size={18} />

              </button>

              <div
                className="
                  w-12
                  text-center
                  text-2xl
                  font-black
                  text-white
                "
              >
                {quantity}
              </div>

              <button
                onClick={() =>
                  setQuantity(
                    quantity + 1
                  )
                }
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-yellow-400
                  text-black
                  flex
                  items-center
                  justify-center
                "
              >

                <Plus size={18} />

              </button>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <div
          className="
            sticky
            bottom-0
            bg-[#0f0f18]
            border-t
            border-white/5
            p-6
          "
        >

          <button
            onClick={handleSubmit}
            className="
              w-full
              h-16
              rounded-2xl
              bg-yellow-400
              text-black
              font-black
              text-xl
              flex
              items-center
              justify-between
              px-6
              shadow-2xl
              active:scale-[0.99]
              transition-all
            "
          >

            <span>
              Thêm vào giỏ
            </span>

            <span>
              {totalPrice.toLocaleString()}đ
            </span>

          </button>

        </div>

      </div>

    </div>

  );

}

export default ProductCustomizeModal;