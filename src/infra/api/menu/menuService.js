import {

  getMenuItems,

  getFeaturedMenuItems,

  searchMenuItems,

  getMenuCategoryItems,

} from "./menuApi";

import {

  normalizeMenuResponse,

} from "./menuMapper";

/**
 * =========================================================
 * SAFE ARRAY
 * =========================================================
 */

function safeArray(
  value
) {

  return Array.isArray(
    value
  )
    ? value
    : [];

}

/**
 * =========================================================
 * SORT MENU ITEMS
 * =========================================================
 */

function sortMenuItems(
  items = []
) {

  return [...items].sort(

    (
      a,
      b
    ) => {

      /**
       * ===================================================
       * FEATURED FIRST
       * ===================================================
       */

      if (
        a.featured &&
        !b.featured
      ) {

        return -1;

      }

      if (
        !a.featured &&
        b.featured
      ) {

        return 1;

      }

      /**
       * ===================================================
       * AVAILABLE FIRST
       * ===================================================
       */

      if (
        a.available &&
        !b.available
      ) {

        return -1;

      }

      if (
        !a.available &&
        b.available
      ) {

        return 1;

      }

      /**
       * ===================================================
       * PRICE ASC
       * ===================================================
       */

      return (
        (a.price || 0) -
        (b.price || 0)
      );

    }

  );

}

/**
 * =========================================================
 * FILTER ACTIVE ITEMS
 * =========================================================
 */

function filterActiveItems(
  items = []
) {

  return items.filter(
    (item) =>

      item.active !==
      false
  );

}

/**
 * =========================================================
 * FILTER AVAILABLE ITEMS
 * =========================================================
 */

function filterAvailableItems(
  items = []
) {

  return items.filter(
    (item) =>

      item.available !==
      false
  );

}

/**
 * =========================================================
 * BUILD MENU CATEGORIES
 * =========================================================
 */

function buildMenuCategories(
  items = []
) {

  const categoryMap =
    new Map();

  items.forEach(
    (item) => {

      const categoryId =

        item.categoryId ||

        "uncategorized";

      const categoryName =

        item.category?.name ||

        "Uncategorized";

      if (
        !categoryMap.has(
          categoryId
        )
      ) {

        categoryMap.set(

          categoryId,

          {

            id:
              categoryId,

            name:
              categoryName,

            total:
              0,

          }

        );

      }

      const current =

        categoryMap.get(
          categoryId
        );

      current.total += 1;

    }
  );

  return Array.from(
    categoryMap.values()
  );

}

/**
 * =========================================================
 * FETCH MENU ITEMS
 * =========================================================
 */

export async function
fetchMenuItems({

  category,

  keyword,

  featured,

  active = true,

  available = true,

  page = 1,

  limit = 100,

  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =

      await getMenuItems({

        category,

        keyword,

        featured,

        active,

        available,

        page,

        limit,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    let items =

      normalizeMenuResponse(
        response
      );

    items =
      safeArray(
        items
      );

    /**
     * =====================================================
     * FILTER
     * =====================================================
     */

    if (
      active
    ) {

      items =
        filterActiveItems(
          items
        );

    }

    if (
      available
    ) {

      items =
        filterAvailableItems(
          items
        );

    }

    /**
     * =====================================================
     * SORT
     * =====================================================
     */

    items =
      sortMenuItems(
        items
      );

    /**
     * =====================================================
     * CATEGORIES
     * =====================================================
     */

    const categories =

      buildMenuCategories(
        items
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 MENU ITEMS FETCHED",
      {

        total:
          items.length,

        category,

        keyword,

      }
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return {

      items,

      categories,

      pagination: {

        page,

        limit,

        hasMore:

          items.length >=
          limit,

      },

      fetchedAt:
        Date.now(),

      readonly:
        true,

      syncSource:
        "ipos",

    };

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ MENU SERVICE ERROR",
      {

        message:
          error.message,

        category,

        keyword,

      }
    );

    return {

      items: [],

      categories: [],

      pagination: {

        page,

        limit,

        hasMore: false,

      },

      fetchedAt:
        Date.now(),

      readonly:
        true,

      syncSource:
        "ipos",

      error:
        error.message,

    };

  }

}

/**
 * =========================================================
 * FETCH FEATURED MENU ITEMS
 * =========================================================
 */

export async function
fetchFeaturedMenuItems(
  options = {}
) {

  return fetchMenuItems({

    ...options,

    featured:
      true,

  });

}

/**
 * =========================================================
 * SEARCH MENU ITEMS
 * =========================================================
 */

export async function
searchMenu({

  keyword,

  ...options

} = {}) {

  return fetchMenuItems({

    ...options,

    keyword,

  });

}

/**
 * =========================================================
 * FETCH CATEGORY MENU ITEMS
 * =========================================================
 */

export async function
fetchMenuCategory({

  category,

  ...options

} = {}) {

  return fetchMenuItems({

    ...options,

    category,

  });

}

/**
 * =========================================================
 * FETCH MENU CATEGORIES
 * =========================================================
 */

export async function
fetchMenuCategories(
  options = {}
) {

  const result =

    await fetchMenuItems(
      options
    );

  return result.categories;

}