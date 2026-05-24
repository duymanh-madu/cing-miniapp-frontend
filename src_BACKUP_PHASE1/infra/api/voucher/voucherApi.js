import httpClient from "@/api/client/httpClient";

import {
  resolveHttpError,
} from "@/api/errors/httpErrorHandler";

/**
 * =========================================================
 * MENU API ENDPOINTS
 * =========================================================
 *
 * IMPORTANT:
 * - ONE WAY SYNC ONLY
 * - iPOS -> Backend -> Frontend
 * - NO CREATE / UPDATE / DELETE MENU
 * - READONLY MENU GOVERNANCE
 * =========================================================
 */

export const MENU_API_ENDPOINTS =
  Object.freeze({

    /**
     * =====================================================
     * MENU
     * =====================================================
     */

    ALL:
      "/api/menu/items",

    FEATURED:
      "/api/menu/featured",

    SEARCH:
      "/api/menu/search",

    /**
     * =====================================================
     * DETAIL
     * =====================================================
     */

    DETAIL:
      (itemId) =>

        `/api/menu/items/${itemId}`,

    /**
     * =====================================================
     * CATEGORY
     * =====================================================
     */

    CATEGORY:
      (categoryId) =>

        `/api/menu/category/${categoryId}`,

    /**
     * =====================================================
     * CATEGORIES
     * =====================================================
     */

    CATEGORIES:
      "/api/menu/categories",

    /**
     * =====================================================
     * iPOS SYNC
     * =====================================================
     */

    SYNC_STATUS:
      "/api/menu/sync/status",

    SYNC_SNAPSHOT:
      "/api/menu/sync/snapshot",

  });

/**
 * =========================================================
 * EXTRACT RESPONSE DATA
 * =========================================================
 */

function extractResponseData(
  response,
  fallback = []
) {

  return (

    response?.data?.data ||

    response?.data?.items ||

    response?.data?.menu ||

    response?.data ||

    fallback

  );

}

/**
 * =========================================================
 * BUILD REQUEST METADATA
 * =========================================================
 */

function buildRequestMetadata({

  startedAt,
  url,

}) {

  return {

    url,

    duration:
      `${Date.now() - startedAt}ms`,

    timestamp:
      Date.now(),

    source:
      "ipos-sync",

  };

}

/**
 * =========================================================
 * SAFE GET REQUEST
 * =========================================================
 */

async function safeGetRequest({

  url,
  params,
  signal,
  fallback = [],

}) {

  const startedAt =
    Date.now();

  try {

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =
      await httpClient.get(
        url,
        {

          params,

          signal,

        }
      );

    /**
     * =====================================================
     * DATA
     * =====================================================
     */

    const data =
      extractResponseData(
        response,
        fallback
      );

    /**
     * =====================================================
     * OBSERVABILITY
     * =====================================================
     */

    console.log(
      "🟢 MENU API SUCCESS",
      buildRequestMetadata({

        startedAt,

        url,

      })
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return data;

  } catch (error) {

    /**
     * =====================================================
     * PARSE
     * =====================================================
     */

    const parsedError =
      resolveHttpError(
        error
      );

    /**
     * =====================================================
     * OBSERVABILITY
     * =====================================================
     */

    console.error(
      "❌ MENU API ERROR",
      {

        ...buildRequestMetadata({

          startedAt,

          url,

        }),

        error:
          parsedError,

      }
    );

    /**
     * =====================================================
     * THROW
     * =====================================================
     */

    throw parsedError;

  }

}

/**
 * =========================================================
 * GET MENU ITEMS
 * =========================================================
 */

export async function
getMenuItems({

  categoryId,

  keyword,

  featured,

  available,

  syncVersion,

  page = 1,

  limit = 100,

  signal,

} = {}) {

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .ALL,

    signal,

    params: {

      categoryId,

      keyword,

      featured,

      available,

      syncVersion,

      page,

      limit,

    },

    fallback: [],

  });

}

/**
 * =========================================================
 * GET FEATURED MENU ITEMS
 * =========================================================
 */

export async function
getFeaturedMenuItems({

  limit = 20,

  signal,

} = {}) {

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .FEATURED,

    signal,

    params: {

      limit,

    },

    fallback: [],

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

  page = 1,

  limit = 50,

  signal,

}) {

  /**
   * =======================================================
   * VALIDATE
   * =======================================================
   */

  if (
    !keyword ||
    typeof keyword !==
      "string"
  ) {

    return [];

  }

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .SEARCH,

    signal,

    params: {

      keyword:
        keyword.trim(),

      page,

      limit,

    },

    fallback: [],

  });

}

/**
 * =========================================================
 * GET MENU ITEM DETAIL
 * =========================================================
 */

export async function
getMenuItemDetail({

  itemId,

  signal,

}) {

  /**
   * =======================================================
   * VALIDATE
   * =======================================================
   */

  if (
    !itemId
  ) {

    throw {

      message:
        "Missing itemId",

      status:
        400,

    };

  }

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .DETAIL(
          itemId
        ),

    signal,

    fallback: {},

  });

}

/**
 * =========================================================
 * GET MENU CATEGORY ITEMS
 * =========================================================
 */

export async function
getMenuCategoryItems({

  categoryId,

  page = 1,

  limit = 100,

  signal,

}) {

  /**
   * =======================================================
   * VALIDATE
   * =======================================================
   */

  if (
    !categoryId
  ) {

    return [];

  }

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .CATEGORY(
          categoryId
        ),

    signal,

    params: {

      page,

      limit,

    },

    fallback: [],

  });

}

/**
 * =========================================================
 * GET MENU CATEGORIES
 * =========================================================
 */

export async function
getMenuCategories({

  signal,

} = {}) {

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .CATEGORIES,

    signal,

    fallback: [],

  });

}

/**
 * =========================================================
 * GET MENU SYNC STATUS
 * =========================================================
 */

export async function
getMenuSyncStatus({

  signal,

} = {}) {

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .SYNC_STATUS,

    signal,

    fallback: {

      synced:
        false,

    },

  });

}

/**
 * =========================================================
 * GET MENU SYNC SNAPSHOT
 * =========================================================
 */

export async function
getMenuSyncSnapshot({

  signal,

} = {}) {

  return safeGetRequest({

    url:

      MENU_API_ENDPOINTS
        .SYNC_SNAPSHOT,

    signal,

    fallback: {},

  });

}