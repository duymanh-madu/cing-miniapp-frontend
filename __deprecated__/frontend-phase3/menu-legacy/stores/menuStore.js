import {
  create,
} from "zustand";

/**
 * =====================================================
 * MENU STORE
 * =====================================================
 */

const useMenuStore =
  create(
    (
      set,
      get
    ) => ({

      /**
       * =====================================================
       * DATA
       * =====================================================
       */

      items: [],

      categories: [],

      selectedCategory:
        "ALL",

      selectedItem:
        null,

      selectedModifiers:
        {},

      /**
       * =====================================================
       * ITEMS
       * =====================================================
       */

      setItems:
        (
          items
        ) => {

          const categories =
            [

              "ALL",

              ...new Set(

                items.map(
                  (
                    item
                  ) =>
                    item.category
                )

              ),

            ];

          set({

            items,

            categories,

          });

        },

      /**
       * =====================================================
       * CATEGORY
       * =====================================================
       */

      setSelectedCategory:
        (
          category
        ) => {

          set({

            selectedCategory:
              category,

          });

        },

      /**
       * =====================================================
       * MODAL
       * =====================================================
       */

      setSelectedItem:
        (
          item
        ) => {

          set({

            selectedItem:
              item,

            selectedModifiers:
              {},

          });

        },

      /**
       * =====================================================
       * MODIFIERS
       * =====================================================
       */

      toggleModifierOption:
        (
          modifierId,
          option
        ) => {

          const current =
            get()
              .selectedModifiers;

          const modifier =
            current[
              modifierId
            ] || [];

          const exists =
            modifier.find(
              (
                item
              ) =>
                item.id ===
                option.id
            );

          if (
            exists
          ) {

            set({

              selectedModifiers:
                {

                  ...current,

                  [modifierId]:

                    modifier.filter(
                      (
                        item
                      ) =>
                        item.id !==
                        option.id
                    ),

                },

            });

          } else {

            set({

              selectedModifiers:
                {

                  ...current,

                  [modifierId]:
                    [

                      ...modifier,

                      option,

                    ],

                },

            });

          }

        },

      /**
       * =====================================================
       * PRICE ENGINE
       * =====================================================
       */

      calculateModifierPrice:
        () => {

          const modifiers =
            get()
              .selectedModifiers;

          let total = 0;

          Object.values(
            modifiers
          ).forEach(
            (
              group
            ) => {

              group.forEach(
                (
                  option
                ) => {

                  total +=
                    Number(
                      option.price || 0
                    );

                }
              );

            }
          );

          return total;

        },

    })
  );

export default
  useMenuStore;