import useMenuStore
  from "@/menu/stores/menuStore";

/**
 * =====================================================
 * MENU CARD
 * =====================================================
 */

function MenuCard({
  item,
}) {

  const setSelectedItem =
    useMenuStore(
      (
        state
      ) =>
        state.setSelectedItem
    );

  return (

    <button

      onClick={() =>
        setSelectedItem(
          item
        )
      }

      className="
        group
        flex
        items-center
        gap-4

        rounded-3xl
        border
        border-zinc-800

        bg-zinc-950/90

        p-4

        text-left

        transition-all
        duration-300

        hover:border-yellow-500/40
        hover:bg-zinc-900
        hover:shadow-2xl
        hover:shadow-yellow-500/10
      "
    >

      {/* IMAGE */}

      <div
        className="
          h-24
          w-24

          overflow-hidden

          rounded-2xl

          bg-zinc-900

          flex-shrink-0
        "
      >

        <img
  src={
    item.image
  }

  alt={
    item.name
  }

  onError={(
    e
  ) => {

    e.currentTarget.src =
      "https://placehold.co/600x600/111111/FACC15?text=Cing+Hu+Tang";

  }}

  className="
    h-full
    w-full

    object-contain
    object-center

    transition-transform
    duration-500

    group-hover:scale-105
  "
/>

      </div>

      {/* CONTENT */}

      <div
        className="
          flex-1
          overflow-hidden
        "
      >

        <h3
          className="
            line-clamp-2

            text-lg
            font-black
            uppercase

            text-white
          "
        >

          {item.name}

        </h3>

        <p
          className="
            mt-2

            text-sm
            text-zinc-400

            line-clamp-2
          "
        >

          {
            item.description ||
            "Best seller tại Cing Hu Tang"
          }

        </p>

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
          "
        >

          <span
            className="
              text-xl
              font-black

              text-yellow-400
            "
          >

            {
              Number(
                item.price
              ).toLocaleString()
            }đ

          </span>

          <div
            className="
              rounded-full

              bg-yellow-500/10

              px-3
              py-1

              text-xs
              font-bold

              text-yellow-400
            "
          >

            Xem thêm

          </div>

        </div>

      </div>

    </button>

  );

}

export default
  MenuCard;