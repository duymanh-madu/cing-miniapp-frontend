import axios from "axios";

import useMenuStore from "@/menu/stores/menuStore";

/**
 * =====================================================
 * API
 * =====================================================
 */

const API_URL =
  import.meta.env
    .VITE_API_URL;

/**
 * =====================================================
 * NORMALIZE MODIFIERS
 * =====================================================
 */

function normalizeModifiers(
  item
) {

  const rawModifiers =

    item.modifiers ||

    item.options ||

    item.toppings ||

    item.extras ||

    [];

  return rawModifiers.map(
    (
      modifier
    ) => ({

      id:
        modifier.id ||

        modifier.modifier_id ||

        crypto.randomUUID(),

      name:
        modifier.name ||

        "Modifier",

      required:
        modifier.required ||
        false,

      multiSelect:
        modifier.multiSelect ??
        true,

      maxSelect:
        modifier.maxSelect ||
        10,

      options:
        (
          modifier.options ||
          modifier.items ||
          []
        ).map(
          (
            option
          ) => ({

            id:
              option.id ||

              option.option_id ||

              crypto.randomUUID(),

            name:
              option.name ||

              "Option",

            price:
              Number(
                option.price || 0
              ),

          })
        ),

    })
  );

}

/**
 * =====================================================
 * NORMALIZE IMAGE
 * =====================================================
 */

function normalizeImage(
  item
) {

  return (

    item.image ||

    item.thumbnail ||

    item.picture ||

    item.photo ||

    item.avatar ||

    item.img ||

    ""

  );

}

/**
 * =====================================================
 * NORMALIZE CATEGORY
 * =====================================================
 */

function normalizeCategory(
  item
) {

  return (

    item.category ||

    item.category_name ||

    item.group_name ||

    item.menu_name ||

    "MENU"

  );

}

/**
 * =====================================================
 * NORMALIZE ITEM
 * =====================================================
 */

function normalizeItem(
  item
) {

  return {

    id:
      item.id ||

      crypto.randomUUID(),

    name:
      item.name ||

      "Unnamed Item",

    price:
      Number(
        item.price || 0
      ),

    image:
      normalizeImage(
        item
      ),

    description:
      item.description ||

      "",

    category:
      normalizeCategory(
        item
      ),

    modifiers:
      normalizeModifiers(
        item
      ),

  };

}

/**
 * =====================================================
 * EXTRACT ARRAY
 * =====================================================
 */

function extractItems(
  data
) {

  if (
    Array.isArray(
      data
    )
  ) {

    return data;

  }

  if (
    Array.isArray(
      data?.items
    )
  ) {

    return data.items;

  }

  if (
    Array.isArray(
      data?.data
    )
  ) {

    return data.data;

  }

  if (
    Array.isArray(
      data?.products
    )
  ) {

    return data.products;

  }

  return [];

}

/**
 * =====================================================
 * MENU RUNTIME
 * =====================================================
 */

async function initializeMenu() {

  try {

    const response =
      await axios.get(
        `${API_URL}/menu`
      );

    const rawItems =
      extractItems(
        response.data
      );

    console.log(
      "RAW MENU:",
      rawItems
    );

    const items =
      rawItems.map(
        normalizeItem
      );

    console.log(
      "NORMALIZED MENU:",
      items
    );

    useMenuStore
      .getState()
      .setItems(
        items
      );

    console.log(
      "menu initialized"
    );

  } catch (
    error
  ) {

    console.error(
      "menu initialize error",
      error
    );

  }

}

export default
  initializeMenu;