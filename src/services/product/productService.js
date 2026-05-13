import httpClient
  from "../http/httpClient";

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
 * EXTRACT API DATA
 * =========================================================
 */

function extractData(
  response
) {

  if (
    !response ||
    typeof response !==
      "object"
  ) {

    return null;

  }

  return (
    response?.data?.data ||

    response?.data ||

    null
  );

}

/**
 * =========================================================
 * NORMALIZE PRODUCT
 * =========================================================
 */

export function
normalizeProduct(
  product
) {

  const safeProduct =

    product &&
    typeof product ===
      "object"

      ? product

      : {};

  return {

    /**
     * =====================================================
     * IDENTIFIERS
     * =====================================================
     */

    id:

      safeString(

        safeProduct.id ||

        safeProduct.item_id ||

        safeProduct.code ||

        crypto.randomUUID()

      ),

    sku:

      safeString(
        safeProduct.sku
      ),

    /**
     * =====================================================
     * CONTENT
     * =====================================================
     */

    name:

      safeString(

        safeProduct.name ||

        safeProduct.item_name ||

        "Unnamed Product"

      ),

    description:

      safeString(

        safeProduct.description ||

        safeProduct.short_description ||

        ""

      ),

    /**
     * =====================================================
     * PRICING
     * =====================================================
     */

    price:

      safeNumber(

        safeProduct.price ||

        safeProduct.base_price

      ),

    originalPrice:

      safeNumber(

        safeProduct.original_price

      ),

    /**
     * =====================================================
     * MEDIA
     * =====================================================
     */

    image:

      safeString(

        safeProduct.image ||

        safeProduct.thumbnail ||

        ""

      ),

    gallery:

      safeArray(
        safeProduct.gallery
      ),

    /**
     * =====================================================
     * CATEGORY
     * =====================================================
     */

    category:

      safeString(

        safeProduct.category ||

        "milk-tea"

      ),

    /**
     * =====================================================
     * INVENTORY
     * =====================================================
     */

    inventory:

      safeNumber(

        safeProduct.inventory ||

        safeProduct.stock

      ),

    /**
     * =====================================================
     * FLAGS
     * =====================================================
     */

    active:

      safeProduct.active !==
      false,

    featured:
      Boolean(
        safeProduct.featured
      ),

    /**
     * =====================================================
     * REALTIME META
     * =====================================================
     */

    fetchedAt:
      Date.now(),

    sync:
      "synced",

    /**
     * =====================================================
     * RAW
     * =====================================================
     */

    raw: safeProduct,

  };

}

/**
 * =========================================================
 * NORMALIZE PRODUCTS
 * =========================================================
 */

function normalizeProducts(
  products
) {

  return safeArray(
    products
  )
    .map(
      normalizeProduct
    )
    .filter(
      (product) =>
        Boolean(
          product.id
        )
    );

}

/**
 * =========================================================
 * FETCH PRODUCTS
 * =========================================================
 */

export async function
fetchProducts() {

  try {

    const response =

      await httpClient.get(
        "/products"
      );

    const data =
      extractData(
        response
      );

    return normalizeProducts(
      data
    );

  } catch (error) {

    console.error(

      "[FETCH PRODUCTS ERROR]",

      error

    );

    return [];

  }

}

/**
 * =========================================================
 * FETCH FEATURED PRODUCTS
 * =========================================================
 */

export async function
fetchFeaturedProducts() {

  try {

    const response =

      await httpClient.get(
        "/products/featured"
      );

    const data =
      extractData(
        response
      );

    return normalizeProducts(
      data
    );

  } catch (error) {

    console.error(

      "[FEATURED PRODUCTS ERROR]",

      error

    );

    return [];

  }

}

/**
 * =========================================================
 * FETCH PRODUCT DETAIL
 * =========================================================
 */

export async function
fetchProductById(
  productId
) {

  try {

    if (!productId) {

      return null;

    }

    const response =

      await httpClient.get(

        `/products/${productId}`

      );

    const data =
      extractData(
        response
      );

    if (!data) {

      return null;

    }

    return normalizeProduct(
      data
    );

  } catch (error) {

    console.error(

      "[FETCH PRODUCT DETAIL ERROR]",

      error

    );

    return null;

  }

}

/**
 * =========================================================
 * SEARCH PRODUCTS
 * =========================================================
 */

export async function
searchProducts(
  keyword = ""
) {

  try {

    const response =

      await httpClient.get(
        "/products/search",
        {
          params: {
            keyword,
          },
        }
      );

    const data =
      extractData(
        response
      );

    return normalizeProducts(
      data
    );

  } catch (error) {

    console.error(

      "[SEARCH PRODUCTS ERROR]",

      error

    );

    return [];

  }

}