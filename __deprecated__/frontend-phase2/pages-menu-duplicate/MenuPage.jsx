import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import apiClient from "@/infra/api/apiClient";

import useCartStore from "@/features/menu/store/cartStore";

import ProductCustomizeModal from "./components/ProductCustomizeModal";

/**
 * =====================================================
 * MENU PAGE VIP PRO 10/10
 * MOBILE FIRST
 * HERMES ORANGE + CREAM
 * ULTRA COMPACT
 * REALTIME READY
 * =====================================================
 */

function MenuPage() {

  const navigate =
    useNavigate();

  /**
   * =====================================================
   * STATE
   * =====================================================
   */

  const [
    items,
    setItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    keyword,
    setKeyword,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("ALL");

  const [
    selectedItem,
    setSelectedItem,
  ] = useState(null);

  /**
   * =====================================================
   * CART
   * =====================================================
   */

  const cartItems =
    useCartStore(
      (state) =>
        state.items
    );

  const addItem =
    useCartStore(
      (state) =>
        state.addItem
    );

  /**
   * =====================================================
   * LOAD MENU
   * =====================================================
   */

  useEffect(() => {

    async function loadMenu() {

      try {

        const response =
          await apiClient.get(
            "/api/menu"
          );

        const rawData =
          response?.data?.data ||
          response?.data?.items ||
          response?.data ||
          [];

        setItems(
          Array.isArray(rawData)
            ? rawData
            : []
        );

      } catch (error) {

        console.error(
          "MENU ERROR:",
          error
        );

        setItems([]);

      } finally {

        setLoading(false);

      }

    }

    loadMenu();

  }, []);

  /**
   * =====================================================
   * CATEGORY
   * =====================================================
   */

  const categories =
    useMemo(() => {

      const values =
        items.map(
          (item) =>
            item.category ||
            item.group_name ||
            item.group ||
            item.type ||
            "OTHER"
        );

      return [
        "ALL",
        ...new Set(values),
      ];

    }, [items]);

  /**
   * =====================================================
   * FILTER
   * =====================================================
   */

  const filteredItems =
    useMemo(() => {

      return items.filter(
        (item) => {

          const category =
            item.category ||
            item.group_name ||
            item.group ||
            item.type ||
            "OTHER";

          const matchCategory =
            selectedCategory ===
              "ALL" ||
            category ===
              selectedCategory;

          const matchKeyword =
            (
              item.name ||
              ""
            )
              .toLowerCase()
              .includes(
                keyword.toLowerCase()
              );

          return (
            matchCategory &&
            matchKeyword
          );

        }
      );

    }, [
      items,
      keyword,
      selectedCategory,
    ]);

  /**
   * =====================================================
   * TOTAL PRICE
   * =====================================================
   */

  const totalPrice =
    useMemo(() => {

      return cartItems.reduce(
        (
          total,
          item
        ) =>
          total +
          (
            item.totalPrice ||
            0
          ),
        0
      );

    }, [cartItems]);

  /**
   * =====================================================
   * ADD CART
   * =====================================================
   */

  function handleAddToCart(
    cartItem
  ) {

    addItem(
      cartItem
    );

    setSelectedItem(
      null
    );

  }

  /**
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-[#f6efe4]
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            w-14
            h-14
            rounded-full
            border-4
            border-[#ffb347]/20
            border-t-[#ff7b00]
            animate-spin
          "
        />

      </div>

    );

  }

  /**
   * =====================================================
   * UI
   * =====================================================
   */

  return (

    <div
      className="
        min-h-screen
        bg-[#f6efe4]
        pb-36
      "
    >

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-[#f6efe4]/95
          backdrop-blur-xl
          border-b
          border-[#eadcc7]
        "
      >

        <div
          className="
            px-4
            pt-4
            pb-4
          "
        >

          {/* TOP */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              {/* BACK */}

              <button
                onClick={() =>
                  navigate("/")
                }
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-white
                  shadow-md
                  flex
                  items-center
                  justify-center
                  active:scale-95
                  transition-all
                "
              >

                <ArrowLeft
                  size={20}
                  className="
                    text-[#2b160b]
                  "
                />

              </button>

              {/* TITLE */}

              <div>

                <div
                  className="
                    text-[10px]
                    tracking-[2px]
                    font-black
                    uppercase
                    text-[#b98a4a]
                  "
                >

                  CING HU TANG

                </div>

                <div
                  className="
                    text-[34px]
                    font-black
                    leading-none
                    text-[#2b160b]
                  "
                >

                  Menu

                </div>

              </div>

            </div>

            {/* LOGO */}

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-white
                shadow-md
                p-1
              "
            >

              <img
                src="/logo-cing.png"
                alt="logo"
                className="
                  w-full
                  h-full
                  object-contain
                "
              />

            </div>

          </div>

          {/* SEARCH */}

          <div
            className="
              mt-4
              relative
            "
          >

            <Search
              size={18}
              className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                text-[#9c7c52]
              "
            />

            <input
              value={keyword}
              onChange={(e) =>
                setKeyword(
                  e.target.value
                )
              }
              placeholder="Tìm món yêu thích..."
              className="
                w-full
                h-12
                rounded-[22px]
                bg-white
                border
                border-[#eadcc7]
                pl-12
                pr-4
                text-[#2b160b]
                font-semibold
                text-[14px]
                outline-none
                shadow-sm
              "
            />

          </div>

          {/* CATEGORY */}

          <div
            className="
              flex
              gap-2
              overflow-x-auto
              scrollbar-hide
              mt-4
              pb-1
            "
          >

            {categories.map(
              (category) => (

                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                  className={`
                    shrink-0
                    px-4
                    h-9
                    rounded-full
                    text-[11px]
                    font-black
                    transition-all
                    border

                    ${
                      selectedCategory ===
                      category

                        ? `
                          bg-gradient-to-r
                          from-[#ffb347]
                          to-[#ff7b00]
                          text-white
                          border-transparent
                          shadow-md
                        `

                        : `
                          bg-white
                          text-[#2b160b]
                          border-[#eadcc7]
                        `
                    }
                  `}
                >

                  {category}

                </button>

              )
            )}

          </div>

        </div>

      </div>

      {/* ===================================================== */}
      {/* PERFECT MENU GRID */}
      {/* ===================================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
          px-3
          py-4
        "
      >

        {filteredItems.map(
          (
            item,
            index
          ) => {

            const imageUrl =
              item.image ||
              item.thumbnail ||
              item.photo ||
              item.picture ||
              "/logo-cing.png";

            const price =
              Number(
                item.price ||
                item.sale_price ||
                0
              );

            return (

              <div
                key={
                  item.id ||
                  index
                }
                className="
                  bg-white
                  border
                  border-[#eadcc7]
                  rounded-[26px]
                  p-3
                  shadow-[0_6px_20px_rgba(0,0,0,0.05)]
                  transition-all
                  duration-200
                  hover:-translate-y-[2px]
                  hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]
                "
              >

                {/* CARD TOP */}

                <div
                  className="
                    flex
                    gap-3
                  "
                >

                  {/* IMAGE */}

                  <div
                    className="
                      w-[62px]
                      h-[62px]
                      rounded-[18px]
                      overflow-hidden
                      shrink-0
                      bg-gradient-to-br
                      from-[#ffb347]
                      to-[#ff7b00]
                      p-[2px]
                      shadow-md
                    "
                  >

                    <div
                      className="
                        w-full
                        h-full
                        bg-white
                        rounded-[16px]
                        overflow-hidden
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="
                          w-full
                          h-full
                          object-contain
                          p-[5px]
                        "
                      />

                    </div>

                  </div>

                  {/* INFO */}

                  <div
                    className="
                      flex-1
                      min-w-0
                      flex
                      flex-col
                      justify-between
                    "
                  >

                    {/* NAME */}

                    <div
                      className="
                        text-[#2b160b]
                        font-black
                        text-[13px]
                        leading-[1.35]
                        line-clamp-2
                        min-h-[38px]
                      "
                    >

                      {item.name}

                    </div>

                    {/* PRICE + BUTTON */}

                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >

                      {/* PRICE */}

                      <div
                        className="
                          text-[#ff7b00]
                          font-black
                          text-[22px]
                          leading-none
                          tracking-[-0.5px]
                        "
                      >

                        {price.toLocaleString()}đ

                      </div>

                      {/* BUTTON */}

                      <button
                        onClick={() =>
                          setSelectedItem(
                            item
                          )
                        }
                        className="
                          h-9
                          px-4
                          rounded-full
                          bg-gradient-to-r
                          from-[#ffb347]
                          to-[#ff7b00]
                          text-white
                          font-black
                          text-[12px]
                          flex
                          items-center
                          justify-center
                          gap-1
                          shadow-md
                          active:scale-[0.96]
                          transition-all
                          shrink-0
                        "
                      >

                        <Plus
                          size={13}
                        />

                        Thêm

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            );

          }
        )}

      </div>

      {/* ===================================================== */}
      {/* FLOATING CART */}
      {/* ===================================================== */}

      {!!cartItems.length && (

        <button
          onClick={() =>
            navigate(
              "/checkout"
            )
          }
          className="
            fixed
            bottom-5
            left-4
            right-4
            h-[68px]
            rounded-[28px]
            bg-gradient-to-r
            from-[#2b160b]
            to-[#4a2814]
            text-white
            px-5
            shadow-2xl
            flex
            items-center
            justify-between
            z-50
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-11
                h-11
                rounded-full
                bg-[#ff9f1a]
                flex
                items-center
                justify-center
              "
            >

              <ShoppingBag
                size={18}
              />

            </div>

            <div>

              <div
                className="
                  text-[12px]
                  text-[#ffe3bc]
                  font-bold
                "
              >

                {cartItems.length}
                {" "}
                món

              </div>

              <div
                className="
                  text-[20px]
                  font-black
                "
              >

                {totalPrice.toLocaleString()}đ

              </div>

            </div>

          </div>

          <div
            className="
              text-[16px]
              font-black
            "
          >

            Giỏ hàng →

          </div>

        </button>

      )}

      {/* ===================================================== */}
      {/* PRODUCT MODAL */}
      {/* ===================================================== */}

      <ProductCustomizeModal
        item={selectedItem}
        onClose={() =>
          setSelectedItem(
            null
          )
        }
        onAddToCart={
          handleAddToCart
        }
      />

    </div>

  );

}

export default
  MenuPage;