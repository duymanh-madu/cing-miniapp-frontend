import {
  useEffect,
} from "react";

import {
  FaArrowRight,
  FaFire,
  FaStar,
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

  /**
   * =======================================================
   * FORMAT PRICE
   * =======================================================
   */

  const formattedPrice =
    Number(
      product.price || 0
    ).toLocaleString(
      "vi-VN"
    );

  return (

    <div
      className="
        relative
        min-w-[240px]
        overflow-hidden
        rounded-[32px]
        border
        border-white/60
        bg-white/85
        p-4
        shadow-[0_15px_40px_rgba(0,0,0,0.08)]
        backdrop-blur-2xl
      "
    >

      {/* GLOW */}

      <div
        className="
          absolute
          right-[-30px]
          top-[-30px]
          h-[120px]
          w-[120px]
          rounded-full
          bg-orange-200/20
          blur-3xl
        "
      />

      {/* BADGE */}

      {product.badge && (

        <div
          className="
            relative
            z-10
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-[#2b1800]
            px-3
            py-1.5
            text-[10px]
            font-black
            uppercase
            tracking-[0.14em]
            text-white
          "
        >

          <FaFire
            className="
              text-orange-300
            "
          />

          {product.badge}

        </div>

      )}

      {/* IMAGE */}

      <div
        className="
          relative
          z-10
          mt-5
          flex
          h-[120px]
          items-center
          justify-center
          overflow-hidden
          rounded-[28px]
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
              text-[56px]
            "
          >
            🧋
          </div>

        )}

      </div>

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          mt-5
        "
      >

        <h3
          className="
            text-[18px]
            font-black
            leading-[1.2]
            tracking-[-0.03em]
            text-[#2b1800]
          "
        >
          {product.name}
        </h3>

        <p
          className="
            mt-2
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

          {/* PRICE */}

          <div>

            <p
              className="
                text-[11px]
                font-semibold
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
                text-[24px]
                font-black
                tracking-[-0.03em]
                text-[#f28c28]
              "
            >
              {formattedPrice}đ
            </div>

          </div>

          {/* CTA */}

          <button
            className="
              flex
              h-[48px]
              w-[48px]
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-[#f28c28]
              to-[#ff9f3f]
              text-white
              shadow-[0_10px_25px_rgba(242,140,40,0.35)]
              transition-all
              duration-300
              active:scale-[0.95]
            "
          >

            <FaArrowRight />

          </button>

        </div>

      </div>

    </div>

  );

}

/**
 * =========================================================
 * MENU PREVIEW
 * =========================================================
 */

function MenuPreview() {

  /**
   * =======================================================
   * STORE
   * =======================================================
   */

  const {

    featuredProducts,

    featuredLoading,

    loadFeaturedProducts,

  } =
    useProductStore();

  /**
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(() => {

    loadFeaturedProducts();

  }, [

    loadFeaturedProducts,
  ]);

  /**
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (
    featuredLoading
  ) {

    return (

      <section>

        <div
          className="
            flex
            items-center
            justify-center
            rounded-[32px]
            bg-white/70
            p-10
            text-sm
            font-bold
            text-[#7b6a58]
          "
        >
          Đang tải menu...
        </div>

      </section>

    );

  }

  /**
   * =======================================================
   * EMPTY
   * =======================================================
   */

  if (
    !featuredProducts
      ?.length
  ) {

    return null;

  }

  return (

    <section>

      {/* HEADER */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
        "
      >

        {/* LEFT */}

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-orange-100
              px-3
              py-1.5
            "
          >

            <FaStar
              className="
                text-[11px]
                text-[#f28c28]
              "
            />

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#f28c28]
              "
            >
              Premium Drinks
            </span>

          </div>

          <h2
            className="
              mt-3
              text-[24px]
              font-black
              tracking-[-0.04em]
              text-[#2b1800]
            "
          >
            Menu nổi bật
          </h2>

        </div>

        {/* RIGHT */}

        <button
          className="
            flex
            items-center
            gap-2
            rounded-full
            bg-white/80
            px-4
            py-2.5
            text-[12px]
            font-bold
            text-[#2b1800]
            shadow-sm
            backdrop-blur-xl
          "
        >

          Xem tất cả

          <FaArrowRight
            className="
              text-[11px]
            "
          />

        </button>

      </div>

      {/* PRODUCT LIST */}

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          pb-2
          no-scrollbar
        "
      >

        {featuredProducts.map(
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

    </section>

  );

}

export default
  MenuPreview;