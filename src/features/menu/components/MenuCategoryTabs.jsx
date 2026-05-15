import useMenuStore from "@/stores/menuStore";

import useMenuCategories from "../hooks/useMenuCategories";

function MenuCategoryTabs() {

  const categories =
    useMenuCategories();

  const selectedCategory =
    useMenuStore(
      (state) =>
        state.selectedCategory
    );

  const setCategory =
    useMenuStore(
      (state) =>
        state.setCategory
    );

  return (
    <div
      className="
        flex
        gap-3
        overflow-x-auto
      "
    >
      {categories.map(
        (category) => {

          const active =

            selectedCategory ===
            category;

          return (
            <button
              key={category}
              type="button"
              onClick={() =>
                setCategory(
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
                  active
                    ? `
                      bg-black
                      text-white
                    `
                    : `
                      bg-gray-100
                    `
                }
              `}
            >
              {category}
            </button>
          );

        }
      )}
    </div>
  );

}

export default
  MenuCategoryTabs;