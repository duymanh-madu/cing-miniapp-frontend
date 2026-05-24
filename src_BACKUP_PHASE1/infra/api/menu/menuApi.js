import httpClient from "@/api/client/httpClient";

/**
 * =========================================================
 * MENU ENDPOINTS
 * =========================================================
 */

const MENU_ENDPOINTS = {

  ITEMS:
    "/api/menu/items",

};

/**
 * =========================================================
 * MENU SYNC SOURCE
 * =========================================================
 */

export const MENU_SYNC_SOURCE = {

  IPOS:
    "ipos",

};

/**
 * =========================================================
 * EXTRACT MENU DATA
 * =========================================================
 */

function extractMenuData(
  response
) {

  return (

    response?.data?.data ||

    response?.data?.items ||

    response?.data ||

    []

  );

}

/**
 * =========================================================
 * BUILD MENU PARAMS
 * =========================================================
 */

function buildMenuParams({

  category,

  keyword,

  active = true,

  featured,

  page = 1,

  limit = 100,

} = {}) {

  return {

    category:
      category || undefined,

    keyword:
      keyword || undefined,

    active,

    featured,

    page,

    limit,

  };

}

/**
 * =========================================================
 * GET MENU ITEMS
 * =========================================================
 * READ ONLY FROM iPOS
 * NEVER MUTATE FROM FRONTEND
 * =========================================================
 */

export async function
getMenuItems({

  category,

  keyword,

  featured,

  active = true,

  page = 1,

  limit = 100,

  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =

      await httpClient.get(

        MENU_ENDPOINTS.ITEMS,

        {

          signal,

          params:

            buildMenuParams({

              category,

              keyword,

              featured,

              active,

              page,

              limit,

            }),

        }

      );

    /**
     * =====================================================
     * EXTRACT
     * =====================================================
     */

    const items =
      extractMenuData(
        response
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 MENU FETCH SUCCESS",
      {

        total:
          Array.isArray(
            items
          )
            ? items.length
            : 0,

        category,

        keyword,

        syncSource:
          MENU_SYNC_SOURCE.IPOS,

      }
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return {

      items,

      fetchedAt:
        Date.now(),

      syncSource:
        MENU_SYNC_SOURCE.IPOS,

      readonly:
        true,

    };

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ MENU FETCH ERROR",
      {

        category,

        keyword,

        message:
          error.message,

      }
    );

    return {

      items: [],

      fetchedAt:
        Date.now(),

      syncSource:
        MENU_SYNC_SOURCE.IPOS,

      readonly:
        true,

      error:
        error.message,

    };

  }

}

/**
 * =========================================================
 * GET FEATURED MENU ITEMS
 * =========================================================
 */

export async function
getFeaturedMenuItems(
  options = {}
) {

  return getMenuItems({

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
searchMenuItems({

  keyword,

  ...options

} = {}) {

  return getMenuItems({

    ...options,

    keyword,

  });

}

/**
 * =========================================================
 * GET MENU CATEGORY ITEMS
 * =========================================================
 */

export async function
getMenuCategoryItems({

  category,

  ...options

} = {}) {

  return getMenuItems({

    ...options,

    category,

  });

}