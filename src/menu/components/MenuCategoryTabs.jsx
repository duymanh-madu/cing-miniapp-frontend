import useMenuStore from "@/menu/stores/menuStore";

/**
 * =====================================================
 * MENU CATEGORY TABS
 * =====================================================
 */

function MenuCategoryTabs() {

  const categories =
    useMenuStore(
      (
        state
      ) =>
        state.categories
    );

  const selectedCategory =
    useMenuStore(
      (
        state
      ) =>
        state.selectedCategory
    );

  const setSelectedCategory =
    useMenuStore(
      (
        state
      ) =>
        state.setSelectedCategory
    );

  return (

    <div
      className="
        mb-5
        flex
        gap-3
        overflow-x-auto
      "
    >

      {

        categories.map(
          (
            category
          ) => (

            <button
              key={
                category
              }
              onClick={() =>
                setSelectedCategory(
                  category
                )
              }
              className={`
                whitespace-nowrap
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                transition-all

                ${
                  selectedCategory ===
                  category

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

              {category}

            </button>

          )
        )

      }

    </div>

  );

}

export default
  MenuCategoryTabs;