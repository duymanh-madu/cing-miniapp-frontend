import apiLogger from "@/infra/api/apiLogger";
/**
 * =========================================================
 * VOUCHER STATUS
 * =========================================================
 */

export const VOUCHER_STATUS =
  Object.freeze({

    ACTIVE:
      "active",

    EXPIRED:
      "expired",

    INACTIVE:
      "inactive",

    USED:
      "used",

    UPCOMING:
      "upcoming",

  });

/**
 * =========================================================
 * DEFAULT VOUCHER IMAGE
 * =========================================================
 */

const DEFAULT_VOUCHER_IMAGE =
  "/images/voucher-fallback.png";

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

  if (
    typeof value ===
    "boolean"
  ) {

    return value;

  }

  if (
    value === 1 ||
    value === "1"
  ) {

    return true;

  }

  if (
    value === 0 ||
    value === "0"
  ) {

    return false;

  }

  return fallback;

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
 * SAFE DATE
 * =========================================================
 */

function safeDate(
  value
) {

  if (
    !value
  ) {

    return null;

  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )

    ? null

    : date.toISOString();

}

/**
 * =========================================================
 * CALCULATE EXPIRED
 * =========================================================
 */

function isExpired(
  expiredAt
) {

  if (
    !expiredAt
  ) {

    return false;

  }

  return (
    Date.now() >

    new Date(
      expiredAt
    ).getTime()
  );

}

/**
 * =========================================================
 * CALCULATE UPCOMING
 * =========================================================
 */

function isUpcoming(
  startedAt
) {

  if (
    !startedAt
  ) {

    return false;

  }

  return (
    Date.now() <

    new Date(
      startedAt
    ).getTime()
  );

}

/**
 * =========================================================
 * RESOLVE STATUS
 * =========================================================
 */

function resolveVoucherStatus({

  active,
  expired,
  used,
  upcoming,

}) {

  if (
    used
  ) {

    return VOUCHER_STATUS
      .USED;

  }

  if (
    expired
  ) {

    return VOUCHER_STATUS
      .EXPIRED;

  }

  if (
    upcoming
  ) {

    return VOUCHER_STATUS
      .UPCOMING;

  }

  if (
    active
  ) {

    return VOUCHER_STATUS
      .ACTIVE;

  }

  return VOUCHER_STATUS
    .INACTIVE;

}

/**
 * =========================================================
 * NORMALIZE VOUCHER
 * =========================================================
 */

export function
normalizeVoucher(
  voucher = {}
) {

  /**
   * =======================================================
   * DATES
   * =======================================================
   */

  const startedAt =

    safeDate(

      voucher.started_at ||

      voucher.start_date ||

      voucher.startedAt

    );

  const expiredAt =

    safeDate(

      voucher.expired_at ||

      voucher.expiredAt ||

      voucher.end_date

    );

  /**
   * =======================================================
   * STATES
   * =======================================================
   */

  const expired =
    isExpired(
      expiredAt
    );

  const upcoming =
    isUpcoming(
      startedAt
    );

  const used =
    safeBoolean(

      voucher.used ||

      voucher.is_used

    );

  const active =

    voucher.active !==
      false &&

    voucher.active !==
      0 &&

    voucher.active !==
      "0" &&

    !expired;

  /**
   * =======================================================
   * STATUS
   * =======================================================
   */

  const status =
    resolveVoucherStatus({

      active,
      expired,
      used,
      upcoming,

    });

  /**
   * =======================================================
   * DISCOUNT
   * =======================================================
   */

  const discountValue =
    safeNumber(

      voucher.discount_value ||

      voucher.value ||

      voucher.discount

    );

  /**
   * =======================================================
   * MIN ORDER
   * =======================================================
   */

  const minOrderValue =
    safeNumber(

      voucher.min_order_value ||

      voucher.min_order ||

      voucher.minimum_order

    );

  /**
   * =======================================================
   * NORMALIZED
   * =======================================================
   */

  return {

    /**
     * =====================================================
     * IDENTITY
     * =====================================================
     */

    id:

      safeString(

        voucher.id ||

        voucher.voucher_id

      ),

    code:

      safeString(

        voucher.code ||

        voucher.voucher_code

      ),

    /**
     * =====================================================
     * CONTENT
     * =====================================================
     */

    title:

      safeString(

        voucher.title ||

        voucher.name ||

        "Untitled Voucher"

      ),

    description:

      safeString(

        voucher.description ||

        voucher.note

      ),

    shortDescription:

      safeString(

        voucher.short_description

      ),

    /**
     * =====================================================
     * MEDIA
     * =====================================================
     */

    image:

      safeString(

        voucher.image ||

        voucher.thumbnail ||

        DEFAULT_VOUCHER_IMAGE

      ),

    banner:

      safeString(
        voucher.banner
      ),

    /**
     * =====================================================
     * DISCOUNT
     * =====================================================
     */

    discountType:

      safeString(

        voucher.discount_type ||

        voucher.type ||

        "fixed"

      ),

    discountValue,

    maxDiscountValue:

      safeNumber(

        voucher.max_discount_value

      ),

    /**
     * =====================================================
     * CONDITIONS
     * =====================================================
     */

    minOrderValue,

    usageLimit:

      safeNumber(

        voucher.usage_limit

      ),

    remainingUsage:

      safeNumber(

        voucher.remaining_usage

      ),

    applicableProducts:

      safeArray(

        voucher.applicable_products

      ),

    applicableCategories:

      safeArray(

        voucher.applicable_categories

      ),

    /**
     * =====================================================
     * STATUS
     * =====================================================
     */

    active,
    expired,
    upcoming,
    used,

    usable:

      active &&

      !expired &&

      !used &&

      !upcoming,

    status,

    /**
     * =====================================================
     * CAMPAIGN
     * =====================================================
     */

    campaignId:

      safeString(

        voucher.campaign_id

      ),

    campaignName:

      safeString(

        voucher.campaign_name

      ),

    featured:
      safeBoolean(
        voucher.featured
      ),

    /**
     * =====================================================
     * REALTIME
     * =====================================================
     */

    syncVersion:

      safeNumber(

        voucher.sync_version,

        1

      ),

    realtime:
      true,

    source:
      "voucher-api",

    cacheable:
      true,

    /**
     * =====================================================
     * TIMESTAMPS
     * =====================================================
     */

    startedAt,
    expiredAt,

    createdAt:

      safeDate(

        voucher.created_at ||

        voucher.createdAt

      ),

    updatedAt:

      safeDate(

        voucher.updated_at ||

        voucher.updatedAt

      ),

    fetchedAt:
      Date.now(),

    /**
     * =====================================================
     * RAW
     * =====================================================
     */

    raw:
      voucher,

  };

}

/**
 * =========================================================
 * SORT VOUCHERS
 * =========================================================
 */

function sortVouchers(
  vouchers
) {

  return [...vouchers].sort(

    (
      a,
      b
    ) => {

      /**
       * ===================================================
       * USABLE FIRST
       * ===================================================
       */

      if (
        a.usable &&
        !b.usable
      ) {

        return -1;

      }

      if (
        !a.usable &&
        b.usable
      ) {

        return 1;

      }

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
       * NEWEST FIRST
       * ===================================================
       */

      return (

        new Date(
          b.createdAt || 0
        ).getTime()

        -

        new Date(
          a.createdAt || 0
        ).getTime()

      );

    }

  );

}

/**
 * =========================================================
 * NORMALIZE VOUCHER RESPONSE
 * =========================================================
 */

export function
normalizeVoucherResponse(
  response
) {

  /**
   * =======================================================
   * EXTRACT
   * =======================================================
   */

  const vouchers =

    response?.vouchers ||

    response?.data ||

    response ||

    [];

  /**
   * =======================================================
   * SAFE ARRAY
   * =======================================================
   */

  if (
    !Array.isArray(
      vouchers
    )
  ) {

    apiLogger.warn(
      "⚠️ INVALID VOUCHER RESPONSE",
      response
    );

    return [];

  }

  /**
   * =======================================================
   * NORMALIZE
   * =======================================================
   */

  const normalized =
    vouchers
      .map(
        normalizeVoucher
      )
      .filter(
        (
          voucher
        ) => Boolean(
          voucher.id
        )
      );

  /**
   * =======================================================
   * SORT
   * =======================================================
   */

  const sorted =
    sortVouchers(
      normalized
    );

  /**
   * =======================================================
   * OBSERVABILITY
   * =======================================================
   */

  apiLogger.log(
    "🎟️ VOUCHERS NORMALIZED",
    {

      total:
        sorted.length,

      usable:

        sorted.filter(
          (
            voucher
          ) =>
            voucher.usable
        ).length,

      expired:

        sorted.filter(
          (
            voucher
          ) =>
            voucher.expired
        ).length,

    }
  );

  /**
   * =======================================================
   * RETURN
   * =======================================================
   */

  return sorted;

}