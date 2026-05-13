import useMenuStore from "../store/menuStore";

/**
 * ============================================
 * MENU CATEGORIES
 * ============================================
 */

function MenuCategories() {
  const categories =
    useMenuStore(
      (state) =>
        state.categories
    );

  const activeCategory =
    useMenuStore(
      (state) =>
        state.activeCategory
    );

  const setActiveCategory =
    useMenuStore(
      (state) =>
        state.setActiveCategory
    );

  return (
    <div
      className="
        flex
        gap-3
        overflow-x-auto
        pb-2
        no-scrollbar
      "
    >
      {categories.map(
        (category) => (
          <button
            key={category.id}
            onClick={() =>
              setActiveCategory(
                category.id
              )
            }
            className={`
              whitespace-nowrap
              rounded-full
              px-5
              py-3
              text-sm
              font-black
              transition-all

              ${
                activeCategory ===
                category.id
                  ? `
                    bg-brand-orange
                    text-white
                    shadow-[0_15px_35px_rgba(242,140,40,0.35)]
                  `
                  : `
                    bg-white
                    text-gray-700
                  `
              }
            `}
          >
            {category.label}
          </button>
        )
      )}
    </div>
  );
}

export default MenuCategories;