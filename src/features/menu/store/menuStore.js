import {
  create,
} from "zustand";

import menuData from "../mock/menuData";

/**
 * ============================================
 * MENU STORE
 * ============================================
 */

const useMenuStore =
  create((set) => ({
    /**
     * DATA
     */

    categories:
      menuData,

    activeCategory:
      "milk-tea",

    loading: false,

    lastUpdated: null,

    /**
     * ACTIONS
     */

    setCategories:
      (categories) =>
        set({
          categories,
        }),

    setActiveCategory:
      (categoryId) =>
        set({
          activeCategory:
            categoryId,
        }),

    setLoading:
      (value) =>
        set({
          loading: value,
        }),

    updateProductStock:
      ({
        productId,
        stock,
      }) =>
        set((state) => ({
          categories:
            state.categories.map(
              (
                category
              ) => ({
                ...category,

                products:
                  category.products.map(
                    (
                      product
                    ) =>
                      product.id ===
                      productId
                        ? {
                            ...product,

                            stock,
                          }
                        : product
                  ),
              })
            ),
        })),

    updateProductPrice:
      ({
        productId,
        price,
      }) =>
        set((state) => ({
          categories:
            state.categories.map(
              (
                category
              ) => ({
                ...category,

                products:
                  category.products.map(
                    (
                      product
                    ) =>
                      product.id ===
                      productId
                        ? {
                            ...product,

                            price,
                          }
                        : product
                  ),
              })
            ),
        })),

    markMenuUpdated:
      () =>
        set({
          lastUpdated:
            Date.now(),
        }),
  }));

export default useMenuStore;