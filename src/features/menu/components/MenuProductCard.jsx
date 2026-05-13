import {
  FaBolt,
  FaPlus,
} from "react-icons/fa6";

/**
 * ============================================
 * MENU PRODUCT CARD
 * ============================================
 */

function MenuProductCard({
  product,
}) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[30px]
        bg-white
        p-4
        shadow-[0_15px_40px_rgba(0,0,0,0.06)]
      "
    >
      {/* BADGE */}

      {product.badge && (
        <div
          className="
            absolute
            right-3
            top-3
            inline-flex
            items-center
            gap-1
            rounded-full
            bg-brand-orange
            px-2.5
            py-1
            text-[10px]
            font-black
            text-white
          "
        >
          <FaBolt
            className="
              text-[9px]
            "
          />

          {product.badge}
        </div>
      )}

      {/* IMAGE */}

      <div
        className="
          flex
          h-[120px]
          items-center
          justify-center
          rounded-[24px]
          bg-[#fff4e8]
          text-[58px]
        "
      >
        {product.image}
      </div>

      {/* CONTENT */}

      <div
        className="
          mt-4
        "
      >
        <h3
          className="
            text-[17px]
            font-black
            leading-tight
            text-[#2b1800]
          "
        >
          {product.name}
        </h3>

        <p
          className="
            mt-2
            text-[13px]
            text-gray-500
            leading-relaxed
          "
        >
          {product.description}
        </p>

        {/* STOCK */}

        <div
          className="
            mt-3
            inline-flex
            items-center
            rounded-full
            bg-green-100
            px-3
            py-1.5
            text-[11px]
            font-bold
            text-green-700
          "
        >
          Còn {product.stock} món
        </div>

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
                tracking-wide
                text-gray-400
              "
            >
              Giá từ
            </p>

            <div
              className="
                mt-1
                text-[24px]
                font-black
                text-brand-orange
              "
            >
              {product.price.toLocaleString()}đ
            </div>
          </div>

          <button
            className="
              flex
              h-[52px]
              w-[52px]
              items-center
              justify-center
              rounded-2xl
              bg-brand-orange
              text-white
              shadow-[0_15px_35px_rgba(242,140,40,0.35)]
              active:scale-95
              transition-all
            "
          >
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuProductCard;