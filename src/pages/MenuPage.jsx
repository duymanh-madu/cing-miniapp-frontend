import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaMagnifyingGlass,
} from "react-icons/fa6";

import useProductStore
  from "@/stores/productStore";

/**
 * =========================================================
 * PRODUCT CARD
 * =========================================================
 */

function ProductCard({
  product,
}) {

  const formattedPrice =
    Number(
      product.price || 0
    ).toLocaleString(
      "vi-VN"
    );

  return (

    <div
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-white/60
        bg-white/90
        shadow-[0_12px_35px_rgba(0,0,0,0.08)]
        backdrop-blur-2xl
      "
    >

      {/* IMAGE */}

      <div
        className="
          flex
          h-[180px]
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-[#fff2e2]
          to-[#ffe0b8]
        "
      >

        {product.image ? (

          <img
            src={product.image}
            alt={product.name}
            className="
              h-full
              w-full
              object-cover
            "
          />

        ) : (

          <div
            className="
              text-[72px]
            "
          >
            🧋
          </div>

        )}

      </div>

      {/* CONTENT */}

      <div
        className="
          p-4
        "
      >

        <h3
          className="
            text-[18px]
            font-black
            tracking-[-0.03em]
            text-[#2b1800]
          "
        >
          {product.name}
        </h3>

        <p
          className="
            mt-2
            line-clamp-2
            text-[13px]
            leading-relaxed
            text-[#7b6a58]
          "
        >
          {product.description}
        </p>

        {/* FOOTER */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                text-[#a08d7d]
              "
            >
              Giá từ
            </p>

            <div
              className="
                mt-1
                text-[22px]
                font-black
                text-[#f28c28]
              "
            >
              {formattedPrice}đ
            </div>

          </div>

          <button
            className="
              rounded-full
              bg-[#f28c28]
              px-4
              py-2.5
              text-[13px]
              font-bold
              text-white
              transition-all
              active:scale-[0.96]
            "
          >
            Chọn món
          </button>

        </div>

      </div>

    </div>

  );

}

/**
 * =========================================================
 * MENU PAGE
 * =========================================================
 */

function MenuPage() {

  /**
   * =======================================================
   * STORE
   * =======================================================
   */

  const {

    products,

    loading,

    initialized,

    loadProducts,

  } =
    useProductStore();

  /**
   * =======================================================
   * SEARCH
   * =======================================================
   */

  const [search,
    setSearch] =
    useState("");

  /**
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(() => {

    if (
      !initialized
    ) {

      loadProducts();

    }

  }, [

    initialized,

    loadProducts,
  ]);

  /**
   * =======================================================
   * FILTERED PRODUCTS
   * =======================================================
   */

  const filteredProducts =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {

        return products;

      }

      return products.filter(
        (product) =>

          product.name
            ?.toLowerCase()
            .includes(
              keyword
            )
      );

    }, [

      products,

      search,
    ]);

  /**
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (loading) {

    return (

      <div
        className="
          flex
          items-center
          justify-center
          py-20
          text-sm
          font-bold
          text-[#7b6a58]
        "
      >
        Đang tải menu...
      </div>

    );

  }

  return (

    <div
      className="
        px-4
        pb-32
        pt-5
      "
    >

      {/* HEADER */}

      <div>

        <h1
          className="
            text-[32px]
            font-black
            tracking-[-0.05em]
            text-[#2b1800]
          "
        >
          Menu Premium
        </h1>

        <p
          className="
            mt-2
            text-[14px]
            text-[#7b6a58]
          "
        >
          Khám phá các món bán chạy realtime
          từ hệ thống iPOS
        </p>

      </div>

      {/* SEARCH */}

      <div
        className="
          relative
          mt-6
        "
      >

        <FaMagnifyingGlass
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-[#a08d7d]
          "
        />

        <input
          type="text"
          placeholder="Tìm món..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          className="
            h-[56px]
            w-full
            rounded-2xl
            border
            border-white/60
            bg-white/90
            pl-12
            pr-4
            text-[14px]
            outline-none
            backdrop-blur-xl
          "
        />

      </div>

      {/* PRODUCT GRID */}

      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-5
        "
      >

        {filteredProducts.map(
          (product) => (

            <ProductCard
              key={
                product.id
              }
              product={
                product
              }
            />

          )
        )}

      </div>

      {/* EMPTY */}

      {!filteredProducts.length && (

        <div
          className="
            py-20
            text-center
            text-sm
            font-bold
            text-[#7b6a58]
          "
        >
          Không tìm thấy sản phẩm
        </div>

      )}

    </div>

  );

}

export default
  MenuPage;