import apiLogger from "@/infra/api/apiLogger";
import {
  getCampaigns,
} from "./campaignApi";

import {
  normalizeCampaignResponse,
  CAMPAIGN_TYPES,
} from "./campaignMapper";

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
 * IS CAMPAIGN ACTIVE
 * =========================================================
 */

function isCampaignActive(
  campaign
) {

  return (
    campaign?.status ===
    "running"
  );

}

/**
 * =========================================================
 * SORT CAMPAIGNS
 * =========================================================
 */

function sortCampaigns(
  campaigns = []
) {

  return [...campaigns].sort(

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
       * PRIORITY
       * ===================================================
       */

      return (

        (b.priority || 0) -

        (a.priority || 0)

      );

    }

  );

}

/**
 * =========================================================
 * FILTER ACTIVE CAMPAIGNS
 * =========================================================
 */

function filterActiveCampaigns(
  campaigns
) {

  return campaigns.filter(
    isCampaignActive
  );

}

/**
 * =========================================================
 * FILTER FEATURED CAMPAIGNS
 * =========================================================
 */

function filterFeaturedCampaigns(
  campaigns
) {

  return campaigns.filter(
    (campaign) =>
      campaign.featured
  );

}

/**
 * =========================================================
 * FILTER TYPE
 * =========================================================
 */

function filterCampaignType({

  campaigns,
  type,

}) {

  if (!type) {

    return campaigns;

  }

  return campaigns.filter(
    (campaign) =>

      campaign.type ===
      type
  );

}

/**
 * =========================================================
 * LIMIT CAMPAIGNS
 * =========================================================
 */

function limitCampaigns({

  campaigns,
  limit,

}) {

  if (
    !limit ||
    limit <= 0
  ) {

    return campaigns;

  }

  return campaigns.slice(
    0,
    limit
  );

}

/**
 * =========================================================
 * FETCH CAMPAIGNS
 * =========================================================
 */

export async function
fetchCampaigns({

  activeOnly = false,

  featuredOnly = false,

  type = null,

  limit = null,

  page = 1,

  pageSize = 20,

  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =

      await getCampaigns({

        page,

        limit:
          pageSize,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    let campaigns =

      normalizeCampaignResponse(
        response
      );

    campaigns =
      safeArray(
        campaigns
      );

    /**
     * =====================================================
     * ACTIVE
     * =====================================================
     */

    if (
      activeOnly
    ) {

      campaigns =
        filterActiveCampaigns(
          campaigns
        );

    }

    /**
     * =====================================================
     * FEATURED
     * =====================================================
     */

    if (
      featuredOnly
    ) {

      campaigns =
        filterFeaturedCampaigns(
          campaigns
        );

    }

    /**
     * =====================================================
     * TYPE
     * =====================================================
     */

    campaigns =
      filterCampaignType({

        campaigns,

        type,

      });

    /**
     * =====================================================
     * SORT
     * =====================================================
     */

    campaigns =
      sortCampaigns(
        campaigns
      );

    /**
     * =====================================================
     * LIMIT
     * =====================================================
     */

    campaigns =
      limitCampaigns({

        campaigns,

        limit,

      });

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    apiLogger.log(
      "🟢 CAMPAIGN SERVICE SUCCESS",
      {

        total:
          campaigns.length,

        activeOnly,

        featuredOnly,

        type,

      }
    );

    return campaigns;

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    apiLogger.error(
      "❌ CAMPAIGN SERVICE ERROR",
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
 * FEATURED CAMPAIGNS
 * =========================================================
 */

export async function
fetchFeaturedCampaigns(
  options = {}
) {

  return fetchCampaigns({

    ...options,

    featuredOnly:
      true,

  });

}

/**
 * =========================================================
 * ACTIVE CAMPAIGNS
 * =========================================================
 */

export async function
fetchActiveCampaigns(
  options = {}
) {

  return fetchCampaigns({

    ...options,

    activeOnly:
      true,

  });

}

/**
 * =========================================================
 * POPUP CAMPAIGNS
 * =========================================================
 */

export async function
fetchPopupCampaigns(
  options = {}
) {

  return fetchCampaigns({

    ...options,

    type:
      CAMPAIGN_TYPES.POPUP,

  });

}

/**
 * =========================================================
 * BANNER CAMPAIGNS
 * =========================================================
 */

export async function
fetchBannerCampaigns(
  options = {}
) {

  return fetchCampaigns({

    ...options,

    type:
      CAMPAIGN_TYPES.BANNER,

  });

}

/**
 * =========================================================
 * FLASH SALE CAMPAIGNS
 * =========================================================
 */

export async function
fetchFlashSaleCampaigns(
  options = {}
) {

  return fetchCampaigns({

    ...options,

    type:
      CAMPAIGN_TYPES.FLASH_SALE,

  });

}

/**
 * =========================================================
 * GAME CAMPAIGNS
 * =========================================================
 */

export async function
fetchGameCampaigns(
  options = {}
) {

  return fetchCampaigns({

    ...options,

    type:
      CAMPAIGN_TYPES.GAME,

  });

}