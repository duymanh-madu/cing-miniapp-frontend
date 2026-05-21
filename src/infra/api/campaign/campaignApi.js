import httpClient from "@/services/http/httpClient";

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
 * EXTRACT RESPONSE DATA
 * =========================================================
 */

function extractCampaigns(
  response
) {

  return (

    response?.data?.data ||

    response?.data?.campaigns ||

    response?.data ||

    []

  );

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
     * STATUS
     * =====================================================
     */

    active:

      safeBoolean(

        safeCampaign.active,

        true

      ),

    featured:

      safeBoolean(
        safeCampaign.featured
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

        ""

      ),

    thumbnail:

      safeString(

        safeCampaign.thumbnail

      ),

    /**
     * =====================================================
     * NAVIGATION
     * =====================================================
     */

    deeplink:

      safeString(

        safeCampaign.deeplink ||

        safeCampaign.link

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

    /**
     * =====================================================
     * TIMING
     * =====================================================
     */

    startAt:

      safeCampaign.start_at ||
      null,

    endAt:

      safeCampaign.end_at ||
      null,

    /**
     * =====================================================
     * REALTIME META
     * =====================================================
     */

    fetchedAt:
      Date.now(),

    syncSource:
      "api",

    /**
     * =====================================================
     * RAW
     * =====================================================
     */

    raw:
      safeCampaign,

  };

}

/**
 * =========================================================
 * NORMALIZE CAMPAIGNS
 * =========================================================
 */

export function
normalizeCampaigns(
  campaigns
) {

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

/**
 * =========================================================
 * GET CAMPAIGNS
 * =========================================================
 */

export async function
getCampaigns({

  page = 1,

  limit = 20,

  active,

  featured,

  type,

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
        "/api/campaigns",
        {

          signal,

          params: {

            page,

            limit,

            active,

            featured,

            type,

          },

        }
      );

    /**
     * =====================================================
     * EXTRACT
     * =====================================================
     */

    const campaigns =

      extractCampaigns(
        response
      );

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const normalized =

      normalizeCampaigns(
        campaigns
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 CAMPAIGNS FETCHED",
      {

        total:
          normalized.length,

        page,

        limit,

      }
    );

    return normalized;

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ GET CAMPAIGNS ERROR",
      {

        message:
          error.message,

      }
    );

    return [];

  }

}

/**
 * =========================================================
 * GET ACTIVE CAMPAIGNS
 * =========================================================
 */

export async function
getActiveCampaigns(
  options = {}
) {

  return getCampaigns({

    ...options,

    active:
      true,

  });

}

/**
 * =========================================================
 * GET FEATURED CAMPAIGNS
 * =========================================================
 */

export async function
getFeaturedCampaigns(
  options = {}
) {

  return getCampaigns({

    ...options,

    featured:
      true,

  });

}