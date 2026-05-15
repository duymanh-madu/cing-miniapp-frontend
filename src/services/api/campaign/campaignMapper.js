/**
 * =========================================================
 * CAMPAIGN TYPES
 * =========================================================
 */

export const CAMPAIGN_TYPES = {

  BANNER:
    "banner",

  POPUP:
    "popup",

  VOUCHER:
    "voucher",

  FLASH_SALE:
    "flash_sale",

  LOYALTY:
    "loyalty",

  GAME:
    "game",

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
 * SAFE DATE
 * =========================================================
 */

function safeDate(
  value
) {

  if (!value) {

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
 * CAMPAIGN STATUS
 * =========================================================
 */

function resolveCampaignStatus({

  active,
  startDate,
  endDate,

}) {

  const now =
    Date.now();

  const start =
    startDate
      ? new Date(
          startDate
        ).getTime()
      : null;

  const end =
    endDate
      ? new Date(
          endDate
        ).getTime()
      : null;

  if (!active) {

    return "inactive";

  }

  if (
    start &&
    start > now
  ) {

    return "upcoming";

  }

  if (
    end &&
    end < now
  ) {

    return "expired";

  }

  return "running";

}

/**
 * =========================================================
 * NORMALIZE CAMPAIGN
 * =========================================================
 */

export function
normalizeCampaign(
  campaign
) {

  const safeCampaign =

    campaign &&
    typeof campaign ===
      "object"

      ? campaign

      : {};

  /**
   * =======================================================
   * DATES
   * =======================================================
   */

  const startDate =
    safeDate(

      safeCampaign.start_date ||

      safeCampaign.startDate ||

      safeCampaign.start_at

    );

  const endDate =
    safeDate(

      safeCampaign.end_date ||

      safeCampaign.endDate ||

      safeCampaign.end_at

    );

  /**
   * =======================================================
   * ACTIVE
   * =======================================================
   */

  const active =

    safeCampaign.active !==
    false;

  /**
   * =======================================================
   * STATUS
   * =======================================================
   */

  const status =
    resolveCampaignStatus({

      active,

      startDate,

      endDate,

    });

  return {

    /**
     * =====================================================
     * IDENTIFIERS
     * =====================================================
     */

    id:

      safeString(

        safeCampaign.id ||

        safeCampaign.campaign_id ||

        crypto.randomUUID()

      ),

    slug:

      safeString(
        safeCampaign.slug
      ),

    /**
     * =====================================================
     * CONTENT
     * =====================================================
     */

    title:

      safeString(

        safeCampaign.title ||

        safeCampaign.name ||

        "Untitled Campaign"

      ),

    description:

      safeString(

        safeCampaign.description

      ),

    shortDescription:

      safeString(

        safeCampaign.short_description

      ),

    /**
     * =====================================================
     * MEDIA
     * =====================================================
     */

    image:

      safeString(

        safeCampaign.image ||

        safeCampaign.banner ||

        safeCampaign.thumbnail

      ),

    thumbnail:

      safeString(

        safeCampaign.thumbnail

      ),

    gallery:

      safeArray(
        safeCampaign.gallery
      ),

    /**
     * =====================================================
     * TYPE
     * =====================================================
     */

    type:

      safeString(

        safeCampaign.type,

        CAMPAIGN_TYPES.BANNER

      ),

    /**
     * =====================================================
     * FLAGS
     * =====================================================
     */

    active,

    featured:

      safeBoolean(
        safeCampaign.featured
      ),

    dismissible:

      safeBoolean(

        safeCampaign.dismissible,

        true

      ),

    fullscreen:

      safeBoolean(
        safeCampaign.fullscreen
      ),

    /**
     * =====================================================
     * PRIORITY
     * =====================================================
     */

    priority:

      safeNumber(
        safeCampaign.priority
      ),

    displayOrder:

      safeNumber(

        safeCampaign.display_order

      ),

    /**
     * =====================================================
     * CTA
     * =====================================================
     */

    deeplink:

      safeString(

        safeCampaign.deeplink ||

        safeCampaign.link

      ),

    buttonText:

      safeString(

        safeCampaign.button_text ||

        safeCampaign.cta_text

      ),

    /**
     * =====================================================
     * TIME
     * =====================================================
     */

    startDate,

    endDate,

    status,

    /**
     * =====================================================
     * ANALYTICS
     * =====================================================
     */

    trackingKey:

      safeString(

        safeCampaign.tracking_key ||

        safeCampaign.analytics_key

      ),

    /**
     * =====================================================
     * REALTIME META
     * =====================================================
     */

    normalizedAt:
      Date.now(),

    syncSource:
      "api",

    /**
     * =====================================================
     * RAW
     * =====================================================
     */

    metadata:
      safeCampaign,

  };

}

/**
 * =========================================================
 * NORMALIZE CAMPAIGN RESPONSE
 * =========================================================
 */

export function
normalizeCampaignResponse(
  response
) {

  const campaigns =

    response?.campaigns ||

    response?.data ||

    response ||

    [];

  return safeArray(
    campaigns
  )
    .map(
      normalizeCampaign
    )
    .filter(
      (campaign) =>
        Boolean(
          campaign.id
        )
    );

}