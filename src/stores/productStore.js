import { create }
  from "zustand";

import {

  fetchProducts,

  fetchFeaturedProducts,

} from "@/services/product/productService";

/**
 * =========================================================
 * PRODUCT STORE
 * =========================================================
 */

const useProductStore =
  create((set, get) => ({

    /**
     * =====================================================
     * STATE
     * =====================================================
     */

    products: [],

    featuredProducts: [],

    loading: false,

    featuredLoading: false,

    initialized: false,

    error: null,

    /**
     * =====================================================
     * LOAD PRODUCTS
     * =====================================================
     */

    loadProducts:
      async () => {

        /**
         * ================================================
         * PREVENT DUPLICATE LOAD
         * ================================================
         */

        if (
          get().loading
        ) {

          return;

        }

        try {

          set({

            loading: true,

            error: null,

          });

          const products =
            await fetchProducts();

          set({

            products,

            loading: false,

            initialized: true,

          });

        } catch (error) {

          console.error(

            "[PRODUCT STORE ERROR]",

            error

          );

          set({

            loading: false,

            error:
              error.message,

          });

        }

      },

    /**
     * =====================================================
     * LOAD FEATURED PRODUCTS
     * =====================================================
     */

    loadFeaturedProducts:
      async () => {

        if (
          get()
            .featuredLoading
        ) {

          return;

        }

        try {

          set({

            featuredLoading:
              true,

          });

          const products =
            await fetchFeaturedProducts();

          set({

            featuredProducts:
              products,

            featuredLoading:
              false,

          });

        } catch (error) {

          console.error(

            "[FEATURED STORE ERROR]",

            error

          );

          set({

            featuredLoading:
              false,

          });

        }

      },

    /**
     * =====================================================
     * SOCKET UPDATE
     * =====================================================
     */

    updateProductRealtime:
      (payload) => {

        const current =
          get().products;

        const updated =
          current.map(
            (product) => {

              if (
                product.id ===
                payload.id
              ) {

                return {

                  ...product,

                  ...payload,

                };

              }

              return product;

            }
          );

        set({

          products: updated,

        });

      },

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    resetProducts:
      () => {

        set({

          products: [],

          featuredProducts:
            [],

          loading: false,

          featuredLoading:
            false,

          initialized: false,

          error: null,

        });

      },

  }));

export default
  useProductStore;