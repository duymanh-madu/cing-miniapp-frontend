/**
 * =========================================================
 * VOUCHER QUERY ROOT
 * =========================================================
 */

const ROOT =
  "voucher";

/**
 * =========================================================
 * BUILD QUERY KEY
 * =========================================================
 */

function buildKey(
  ...segments
) {

  return [

    ROOT,

    ...segments.filter(
      Boolean
    ),

  ];

}

/**
 * =========================================================
 * SAFE VALUE
 * =========================================================
 */

function safeValue(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "unknown";

  }

  return String(
    value
  );

}

/**
 * =========================================================
 * VOUCHER QUERY KEYS
 * =========================================================
 *
 * ARCHITECTURE:
 * - Enterprise Query Governance
 * - Realtime Invalidation Safe
 * - Campaign/Voucher Engine Ready
 * - Loyalty System Compatible
 * - WebView/Mobile Optimized
 * =========================================================
 */

export const VOUCHER_QUERY_KEYS =
  Object.freeze({

    /**
     * =====================================================
     * ROOT
     * =====================================================
     */

    ALL:
      buildKey(),

    /**
     * =====================================================
     * LIST
     * =====================================================
     */

    LIST:
      buildKey(
        "list"
      ),

    PAGINATED_LIST:
      ({
        page = 1,
        limit = 20,
      } = {}) =>

        buildKey(
          "list",
          "paginated",
          page,
          limit
        ),

    /**
     * =====================================================
     * MEMBER
     * =====================================================
     */

    MEMBER:
      (userId) =>

        buildKey(
          "member",
          safeValue(
            userId
          )
        ),

    MEMBER_AVAILABLE:
      (userId) =>

        buildKey(
          "member",
          safeValue(
            userId
          ),
          "available"
        ),

    MEMBER_ACTIVE:
      (userId) =>

        buildKey(
          "member",
          safeValue(
            userId
          ),
          "active"
        ),

    MEMBER_USED:
      (userId) =>

        buildKey(
          "member",
          safeValue(
            userId
          ),
          "used"
        ),

    MEMBER_EXPIRED:
      (userId) =>

        buildKey(
          "member",
          safeValue(
            userId
          ),
          "expired"
        ),

    /**
     * =====================================================
     * AVAILABLE
     * =====================================================
     */

    AVAILABLE:
      buildKey(
        "available"
      ),

    AVAILABLE_PAGINATED:
      ({
        page = 1,
        limit = 20,
      } = {}) =>

        buildKey(
          "available",
          page,
          limit
        ),

    /**
     * =====================================================
     * ACTIVE
     * =====================================================
     */

    ACTIVE:
      buildKey(
        "active"
      ),

    /**
     * =====================================================
     * EXPIRED
     * =====================================================
     */

    EXPIRED:
      buildKey(
        "expired"
      ),

    /**
     * =====================================================
     * USED / REDEEMED
     * =====================================================
     */

    USED:
      buildKey(
        "used"
      ),

    REDEEMED:
      buildKey(
        "redeemed"
      ),

    CLAIMED:
      buildKey(
        "claimed"
      ),

    /**
     * =====================================================
     * DETAIL
     * =====================================================
     */

    DETAIL:
      (voucherId) =>

        buildKey(
          "detail",
          safeValue(
            voucherId
          )
        ),

    /**
     * =====================================================
     * CAMPAIGN
     * =====================================================
     */

    CAMPAIGN:
      (campaignId) =>

        buildKey(
          "campaign",
          safeValue(
            campaignId
          )
        ),

    CAMPAIGN_ACTIVE:
      (campaignId) =>

        buildKey(
          "campaign",
          safeValue(
            campaignId
          ),
          "active"
        ),

    CAMPAIGN_FEATURED:
      (campaignId) =>

        buildKey(
          "campaign",
          safeValue(
            campaignId
          ),
          "featured"
        ),

    /**
     * =====================================================
     * GAME REWARD
     * =====================================================
     */

    GAME_REWARD:
      buildKey(
        "game-reward"
      ),

    GAME_REWARD_MEMBER:
      (userId) =>

        buildKey(
          "game-reward",
          safeValue(
            userId
          )
        ),

    /**
     * =====================================================
     * FEATURED
     * =====================================================
     */

    FEATURED:
      buildKey(
        "featured"
      ),

    /**
     * =====================================================
     * REALTIME
     * =====================================================
     */

    REALTIME:
      buildKey(
        "realtime"
      ),

    REALTIME_MEMBER:
      (userId) =>

        buildKey(
          "realtime",
          safeValue(
            userId
          )
        ),

    /**
     * =====================================================
     * STATUS
     * =====================================================
     */

    STATUS:
      (status) =>

        buildKey(
          "status",
          safeValue(
            status
          )
        ),

    /**
     * =====================================================
     * SEARCH
     * =====================================================
     */

    SEARCH:
      ({
        keyword = "",
        status,
      } = {}) =>

        buildKey(
          "search",
          keyword.trim(),
          safeValue(
            status
          )
        ),

    /**
     * =====================================================
     * SYNC
     * =====================================================
     */

    SYNC:
      buildKey(
        "sync"
      ),

    SYNC_VERSION:
      (version) =>

        buildKey(
          "sync-version",
          safeValue(
            version
          )
        ),

  });

export default
  VOUCHER_QUERY_KEYS;