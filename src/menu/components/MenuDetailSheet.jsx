import useMenuStore from "@/menu/stores/menuStore";

/**
 * =====================================================
 * MENU DETAIL SHEET
 * =====================================================
 */

function MenuDetailSheet() {

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

  if (!selectedItem) {

    return null;

  }

  const image =

    selectedItem.image ||

    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200";

  const price =

    Number(
      selectedItem.price || 0
    ).toLocaleString(
      "vi-VN"
    );

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        bg-black/70
        backdrop-blur-sm
      "
      onClick={() =>
        setSelectedItem(
          null
        )
      }
    >

      <div
        className="
          max-h-[90vh]
          w-full
          overflow-y-auto
          rounded-t-[32px]
          bg-zinc-950
          p-5
        "
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >

        {/* HANDLE */}

        <div
          className="
            mx-auto
            mb-5
            h-1.5
            w-16
            rounded-full
            bg-zinc-700
          "
        />

        {/* IMAGE */}

        <div
          className="
            overflow-hidden
            rounded-3xl
          "
        >

          <img
            src={image}
            alt={
              selectedItem.name
            }
            className="
              h-72
              w-full
              object-cover
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
              bg-zinc-800
              px-3
              py-1
              text-xs
              font-bold
              uppercase
              text-zinc-300
            "
          >

            {
              selectedItem.category
            }

          </div>

          <h2
            className="
              mt-3
              text-3xl
              font-black
              text-white
            "
          >

            {
              selectedItem.name
            }

          </h2>

          {

            selectedItem.description && (

              <p
                className="
                  mt-3
                  text-sm
                  leading-relaxed
                  text-zinc-400
                "
              >

                {
                  selectedItem.description
                }

              </p>

            )

          }

          <div
            className="
              mt-6
              text-3xl
              font-black
              text-yellow-400
            "
          >

            {price}đ

          </div>

        </div>

        {/* ACTION */}

        <button
          className="
            mt-8
            w-full
            rounded-2xl
            bg-yellow-500
            py-4
            text-lg
            font-black
            text-black
          "
        >

          Thêm vào giỏ hàng

        </button>

      </div>

    </div>

  );

}

export default
  MenuDetailSheet;