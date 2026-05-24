import {
  useMemo,
} from "react";

import useMenu from "./useMenu";

/**
 * =========================================================
 * USE MENU CATEGORIES
 * =========================================================
 */

function useMenuCategories() {

  const {
    data = [],
  } = useMenu();

  return useMemo(() => {

    const categories =
      new Set();

    data.forEach(
      (
        product
      ) => {

        if (
          product.category
        ) {

          categories.add(
            product.category
          );

        }

      }
    );

    return [
      "All",
      ...categories,
    ];

  }, [data]);

}

export default
  useMenuCategories;