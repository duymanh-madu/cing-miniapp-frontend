import useMenuStore from "../store/menuStore";

import MenuProductCard from "./MenuProductCard";

/**
 * ============================================
 * MENU GRID
 * ============================================
 */

function MenuGrid() {
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

  const category =
    categories.find(
      (item) =>
        item.id ===
        activeCategory
    );

  if (!category) {
    return null;
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
      "
    >
      {category.products.map(
        (product) => (
          <MenuProductCard
            key={product.id}
            product={product}
          />
        )
      )}
    </div>
  );
}

export default MenuGrid;