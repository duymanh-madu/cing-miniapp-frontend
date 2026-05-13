import { create }
  from "zustand";

import {

  fetchProducts,

  fetchFeaturedProducts,

  searchProducts,

} from "@/services/product/productService";

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function buildCategoryMap(
  products = []
) {

  const map = {};

  products.forEach(
    (product) => {

      const category =

        product.category ||

        "default";

      if (!map[category]) {

        map[category] = [];

      }

      map[category].push(
        product
      );

    }
  );

  return map;

}

/**
 * =========================================================
 * MENU STORE
 * =========================================================
 */

const useMenuStore =
  create(

    (set, get) => ({

      /**
       * ===================================================
       * CORE STATE
       * ===================================================
       */

      products: [],

      featuredProducts: [],

      categoryMap: {},

      selectedCategory:
        "all",

      searchKeyword: "",

      searchResults: [],

      /**
       * ===================================================
       * STATUS
       * ===================================================
       */

      loading: false,

      searching: false,

      initialized: false,

      stale: false,

      error: null,

      /**
       * ===================================================
       * REALTIME META
       * ===================================================
       */

      lastUpdated: null,

      lastSyncSource:
        "bootstrap",

      /**
       * ===================================================
       * LOAD PRODUCTS
       * ===================================================
       */

      loadProducts:
        async () => {

          try {

            set({

              loading: true,

              error: null,

            });

            /**
             * ===============================================
             * FETCH
             * ===============================================
             */

            const [
              products,
              featuredProducts,
            ] =

              await Promise.all([

                fetchProducts(),

                fetchFeaturedProducts(),

              ]);

            /**
             * ===============================================
             * CATEGORY MAP
             * ===============================================
             */

            const categoryMap =

              buildCategoryMap(
                products
              );

            /**
             * ===============================================
             * UPDATE
             * ===============================================
             */

            set({

              products,

              featuredProducts,

              categoryMap,

              initialized:
                true,

              loading: false,

              stale: false,

              error: null,

              lastUpdated:
                Date.now(),

              lastSyncSource:
                "api",

            });

          } catch (error) {

            console.error(

              "[MENU STORE LOAD ERROR]",

              error

            );

            set({

              loading: false,

              stale: true,

              error:

                error?.message ||

                "Failed to load menu",

            });

          }

        },

      /**
       * ===================================================
       * REFRESH PRODUCTS
       * ===================================================
       */

      refreshProducts:
        async () => {

          const {

            loadProducts,

          } = get();

          return loadProducts();

        },

      /**
       * ===================================================
       * SEARCH
       * ===================================================
       */

      search:
        async (
          keyword = ""
        ) => {

          try {

            set({

              searching:
                true,

              searchKeyword:
                keyword,

            });

            /**
             * ===============================================
             * EMPTY KEYWORD
             * ===============================================
             */

            if (

              !keyword ||

              !keyword.trim()

            ) {

              set({

                searchResults:
                  [],

                searching:
                  false,

              });

              return [];

            }

            /**
             * ===============================================
             * API
             * ===============================================
             */

            const results =

              await searchProducts(
                keyword
              );

            set({

              searchResults:
                results,

              searching:
                false,

            });

            return results;

          } catch (error) {

            console.error(

              "[MENU SEARCH ERROR]",

              error

            );

            set({

              searching:
                false,

              searchResults:
                [],

            });

            return [];

          }

        },

      /**
       * ===================================================
       * CATEGORY
       * ===================================================
       */

      setCategory:
        (
          category
        ) => {

          set({

            selectedCategory:
              category ||

              "all",

          });

        },

      /**
       * ===================================================
       * GET FILTERED PRODUCTS
       * ===================================================
       */

      getFilteredProducts:
        () => {

          const {

            selectedCategory,

            products,

          } = get();

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

        },

      /**
       * ===================================================
       * REALTIME UPSERT
       * ===================================================
       */

      upsertProduct:
        (
          incomingProduct
        ) => {

          if (
            !incomingProduct
          ) {

            return;

          }

          const {

            products,

          } = get();

          const existsIndex =

            products.findIndex(
              (product) =>

                product.id ===

                incomingProduct.id
            );

          /**
           * ===============================================
           * UPDATE
           * ===============================================
           */

          let updatedProducts =
            [];

          if (
            existsIndex >= 0
          ) {

            updatedProducts =

              [...products];

            updatedProducts[
              existsIndex
            ] = {

              ...updatedProducts[
                existsIndex
              ],

              ...incomingProduct,

              sync:
                "realtime",

            };

          }

          /**
           * ===============================================
           * INSERT
           * ===============================================
           */

          else {

            updatedProducts = [

              {
                ...incomingProduct,

                sync:
                  "realtime",
              },

              ...products,

            ];

          }

          /**
           * ===============================================
           * UPDATE STORE
           * ===============================================
           */

          set({

            products:
              updatedProducts,

            categoryMap:

              buildCategoryMap(
                updatedProducts
              ),

            lastUpdated:
              Date.now(),

            lastSyncSource:
              "websocket",

          });

        },

      /**
       * ===================================================
       * REMOVE PRODUCT
       * ===================================================
       */

      removeProduct:
        (
          productId
        ) => {

          const {

            products,

          } = get();

          const filtered =

            products.filter(
              (product) =>

                product.id !==
                productId
            );

          set({

            products:
              filtered,

            categoryMap:

              buildCategoryMap(
                filtered
              ),

            lastUpdated:
              Date.now(),

            lastSyncSource:
              "websocket",

          });

        },

      /**
       * ===================================================
       * RESET SEARCH
       * ===================================================
       */

      clearSearch:
        () => {

          set({

            searchKeyword:
              "",

            searchResults:
              [],

          });

        },

      /**
       * ===================================================
       * RESET STORE
       * ===================================================
       */

      reset:
        () => {

          set({

            products: [],

            featuredProducts:
              [],

            categoryMap: {},

            selectedCategory:
              "all",

            searchKeyword:
              "",

            searchResults: [],

            loading: false,

            searching: false,

            initialized:
              false,

            stale: false,

            error: null,

            lastUpdated: null,

            lastSyncSource:
              "reset",

          });

        },

    })

  );

export default
  useMenuStore;