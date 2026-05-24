import useMenuCategories from "../hooks/useMenuFilters";

/**
 * =========================================================
 * MENU CATEGORIES
 * =========================================================
 */

function MenuCategories() {

  const categories =
    useMenuCategories();

  return (

    <div
      className="
        flex
        gap-3
        overflow-x-auto
        pb-2
      "
    >

      {

        categories.map(
          (
            category
          ) => (

            <button
              key={category}
              className="
                whitespace-nowrap
                rounded-full
                bg-white
                px-4
                py-2
                text-sm
                font-medium
                shadow-sm
              "
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
  MenuCategories;