import { useMemo } from "react";

import useMenuStore from "@/features/menu/store/menuStore";

function useFilteredMenuProducts() {

  const productsById =
    useMenuStore(
      (state) =>
        state.productsById
    );

  const productIds =
    useMenuStore(
      (state) =>
        state.productIds
    );

  const selectedCategory =
    useMenuStore(
      (state) =>
        state.selectedCategory
    );

  return useMemo(() => {

    const products =
      productIds
        .map(
          (id) =>
            productsById[id]
        )
        .filter(Boolean);

    if (
      selectedCategory ===
      "all"
    ) {

      return products;

    }

    return products.filter(
      (product) =>

        product.category ===
        selectedCategory
    );

  }, [

    productsById,
    productIds,
    selectedCategory,

  ]);

}

export default
  useFilteredMenuProducts;