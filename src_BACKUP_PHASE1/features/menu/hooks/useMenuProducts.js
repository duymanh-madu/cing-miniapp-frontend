import { useMemo } from "react";

import {
  useMenuQuery,
} from "@/infra/api/menu/menuQueries";

import useMenuStore from "@/features/menu/store/menuStore";

export function useMenuProducts() {
  const {
    data = [],
    isLoading,
    error,
  } = useMenuQuery();

  const selectedCategory =
    useMenuStore(
      (state) =>
        state.selectedCategory
    );

  const products =
    useMemo(() => {
      if (
        selectedCategory ===
        "all"
      ) {
        return data;
      }

      return data.filter(
        (product) =>
          product.category ===
          selectedCategory
      );
    }, [
      data,
      selectedCategory,
    ]);

  return {
    products,

    isLoading,

    error,
  };
}