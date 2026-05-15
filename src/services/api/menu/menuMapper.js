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
 * MENU TAGS
 * =========================================================
 */

export const MENU_TAGS = {

  NEW:
    "new",

  HOT:
    "hot",

  FEATURED:
    "featured",

  BESTSELLER:
    "bestseller",

  RECOMMENDED:
    "recommended",

};

/**
 * =========================================================
 * SAFE STRING
 * =========================================================
 */

function safeString(
  value,
  fallback = ""
) {

  return typeof value ===
    "string"

    ? value.trim()

    : fallback;

}

/**
 * =========================================================
 * SAFE NUMBER
 * =========================================================
 */

function safeNumber(
  value,
  fallback = 0
) {

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : fallback;

}

/**
 * =========================================================
 * SAFE BOOLEAN
 * =========================================================
 */

function safeBoolean(
  value,
  fallback = false
) {

  return typeof value ===
    "boolean"

    ? value
    : fallback;

}

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
 * SAFE IMAGE
 * =========================================================
 */

function safeImage(
  value
) {

  return safeString(
    value
  );

}

/**
 * =========================================================
 * NORMALIZE CATEGORY
 * =========================================================
 */

function normalizeCategory(
  item
) {

  return {

    id:

      safeString(

        item.category_id ||

        item.categoryId ||

        "uncategorized"

      ),

    name:

      safeString(

        item.category_name ||

        item.category ||

        "Uncategorized"

      ),

  };

}

/**
 * =========================================================
 * BUILD SEARCH KEYWORDS
 * =========================================================
 */

function buildSearchKeywords(
  item
) {

  return [

    item.name,

    item.code,

    item.category?.name,

    ...(item.tags || []),

  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

}

/**
 * =========================================================
 * RESOLVE INVENTORY
 * =========================================================
 */

function resolveInventory(
  item
) {

  const inventory =
    safeNumber(

      item.inventory ||

      item.stock ||

      item.quantity

    );

  return {

    inventory,

    soldOut:
      inventory <= 0,

  };

}

/**
 * =========================================================
 * RESOLVE PRICING
 * =========================================================
 */

function resolvePricing(
  item
) {

  const price =
    safeNumber(
      item.price
    );

  const originalPrice =
    safeNumber(

      item.original_price ||

      item.originalPrice ||

      price

    );

  return {

    price,

    originalPrice,

    discountValue:

      Math.max(
        0,
        originalPrice - price
      ),

    hasDiscount:
      originalPrice > price,

  };

}

/**
 * =========================================================
 * NORMALIZE MENU ITEM
 * =========================================================
 */

export function
normalizeMenuItem(
  item
) {

  const safeItem =

    item &&
    typeof item ===
      "object"

      ? item

      : {};

  /**
   * =======================================================
   * CATEGORY
   * =======================================================
   */

  const category =
    normalizeCategory(
      safeItem
    );

  /**
   * =======================================================
   * INVENTORY
   * =======================================================
   */

  const inventoryState =
    resolveInventory(
      safeItem
    );

  /**
   * =======================================================
   * PRICING
   * =======================================================
   */

  const pricing =
    resolvePricing(
      safeItem
    );

  /**
   * =======================================================
   * TAGS
   * =======================================================
   */

  const tags =
    safeArray(
      safeItem.tags
    );

  /**
   * =======================================================
   * NORMALIZED
   * =======================================================
   */

  const normalized = {

    /**
     * =====================================================
     * IDENTIFIERS
     * =====================================================
     */

    id:

      safeString(

        safeItem.id ||

        safeItem.item_id ||

        safeItem.code ||

        crypto.randomUUID()

      ),

    code:

      safeString(
        safeItem.code
      ),

    sku:

      safeString(
        safeItem.sku
      ),

    /**
     * =====================================================
     * CONTENT
     * =====================================================
     */

    name:

      safeString(

        safeItem.name ||

        safeItem.item_name ||

        "Unnamed Product"

      ),

    description:

      safeString(

        safeItem.description

      ),

    /**
     * =====================================================
     * MEDIA
     * =====================================================
     */

    image:

      safeImage(

        safeItem.image ||

        safeItem.image_url ||

        safeItem.thumbnail

      ),

    gallery:

      safeArray(
        safeItem.gallery
      ),

    /**
     * =====================================================
     * CATEGORY
     * =====================================================
     */

    category,

    categoryId:
      category.id,

    /**
     * =====================================================
     * PRICING
     * =====================================================
     */

    ...pricing,

    currency:
      "VND",

    /**
     * =====================================================
     * INVENTORY
     * =====================================================
     */

    ...inventoryState,

    available:

      safeItem.available !==
        false &&

      !inventoryState.soldOut,

    /**
     * =====================================================
     * FLAGS
     * =====================================================
     */

    featured:

      safeBoolean(
        safeItem.featured
      ),

    active:

      safeItem.active !==
      false,

    realtime:
      true,

    readonly:
      true,

    /**
     * =====================================================
     * TAGS
     * =====================================================
     */

    tags,

    /**
     * =====================================================
     * SEARCH
     * =====================================================
     */

    searchKeywords:
      "",

    /**
     * =====================================================
     * REALTIME META
     * =====================================================
     */

    syncSource:
      MENU_SYNC_SOURCE.IPOS,

    fetchedAt:
      Date.now(),

    updatedAt:
      Date.now(),

    /**
     * =====================================================
     * RAW
     * =====================================================
     */

    metadata:
      safeItem,

  };

  /**
   * =======================================================
   * SEARCH KEYWORDS
   * =======================================================
   */

  normalized.searchKeywords =

    buildSearchKeywords(
      normalized
    );

  return normalized;

}

/**
 * =========================================================
 * NORMALIZE MENU RESPONSE
 * =========================================================
 */

export function
normalizeMenuResponse(
  response
) {

  const items =

    response?.items ||

    response?.data ||

    response ||

    [];

  return safeArray(
    items
  )
    .map(
      normalizeMenuItem
    )
    .filter(
      (item) =>
        Boolean(item.id)
    );

}