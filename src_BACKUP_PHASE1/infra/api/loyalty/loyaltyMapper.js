/**
 * =========================================================
 * MEMBERSHIP LEVELS
 * =========================================================
 */

export const MEMBERSHIP_LEVELS = {

  BRONZE:
    "bronze",

  SILVER:
    "silver",

  GOLD:
    "gold",

  PLATINUM:
    "platinum",

  DIAMOND:
    "diamond",

};

/**
 * =========================================================
 * TRANSACTION TYPES
 * =========================================================
 */

export const TRANSACTION_TYPES = {

  EARN:
    "earn",

  REDEEM:
    "redeem",

  BONUS:
    "bonus",

  REFUND:
    "refund",

  ADJUSTMENT:
    "adjustment",

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
 * NORMALIZE MEMBERSHIP LEVEL
 * =========================================================
 */

function normalizeMembershipLevel(
  level
) {

  const normalized =
    safeString(
      level
    ).toLowerCase();

  if (
    Object.values(
      MEMBERSHIP_LEVELS
    ).includes(
      normalized
    )
  ) {

    return normalized;

  }

  return MEMBERSHIP_LEVELS.BRONZE;

}

/**
 * =========================================================
 * NORMALIZE TRANSACTION TYPE
 * =========================================================
 */

function normalizeTransactionType(
  type
) {

  const normalized =
    safeString(
      type
    ).toLowerCase();

  if (
    Object.values(
      TRANSACTION_TYPES
    ).includes(
      normalized
    )
  ) {

    return normalized;

  }

  return TRANSACTION_TYPES.EARN;

}

/**
 * =========================================================
 * MEMBERSHIP STATUS
 * =========================================================
 */

function resolveMembershipStatus(
  membership
) {

  if (
    membership?.blocked
  ) {

    return "blocked";

  }

  if (
    membership?.active === false
  ) {

    return "inactive";

  }

  return "active";

}

/**
 * =========================================================
 * NORMALIZE MEMBERSHIP
 * =========================================================
 */

export function
normalizeMembership(
  membership
) {

  const safeMembership =

    membership &&
    typeof membership ===
      "object"

      ? membership

      : {};

  /**
   * =======================================================
   * LEVEL
   * =======================================================
   */

  const level =
    normalizeMembershipLevel(

      safeMembership.level ||

      safeMembership.membership_type ||

      safeMembership.tier

    );

  /**
   * =======================================================
   * STATUS
   * =======================================================
   */

  const status =
    resolveMembershipStatus(
      safeMembership
    );

  return {

    /**
     * =====================================================
     * IDENTIFIERS
     * =====================================================
     */

    id:

      safeString(

        safeMembership.id ||

        safeMembership.user_id ||

        crypto.randomUUID()

      ),

    memberCode:

      safeString(

        safeMembership.member_code ||

        safeMembership.code

      ),

    /**
     * =====================================================
     * PROFILE
     * =====================================================
     */

    name:

      safeString(

        safeMembership.name ||

        safeMembership.user_name ||

        "Guest"

      ),

    avatar:

      safeString(
        safeMembership.avatar
      ),

    phone:

      safeString(

        safeMembership.phone ||

        safeMembership.phone_number

      ),

    email:

      safeString(
        safeMembership.email
      ),

    /**
     * =====================================================
     * LOYALTY
     * =====================================================
     */

    points:

      safeNumber(
        safeMembership.points
      ),

    lifetimePoints:

      safeNumber(

        safeMembership.lifetime_points

      ),

    expiringPoints:

      safeNumber(

        safeMembership.expiring_points

      ),

    totalSpent:

      safeNumber(

        safeMembership.total_spent ||

        safeMembership.spending

      ),

    totalOrders:

      safeNumber(

        safeMembership.total_orders

      ),

    /**
     * =====================================================
     * MEMBERSHIP
     * =====================================================
     */

    level,

    nextLevel:

      safeString(
        safeMembership.next_level
      ),

    status,

    /**
     * =====================================================
     * PROGRESSION
     * =====================================================
     */

    progressionPercent:

      safeNumber(

        safeMembership.progression_percent

      ),

    pointsToNextLevel:

      safeNumber(

        safeMembership.points_to_next_level

      ),

    /**
     * =====================================================
     * TIME
     * =====================================================
     */

    joinedAt:

      safeDate(

        safeMembership.joined_at ||

        safeMembership.created_at

      ),

    updatedAt:

      safeDate(
        safeMembership.updated_at
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
      safeMembership,

  };

}

/**
 * =========================================================
 * NORMALIZE TRANSACTION
 * =========================================================
 */

export function
normalizeTransaction(
  transaction
) {

  const safeTransaction =

    transaction &&
    typeof transaction ===
      "object"

      ? transaction

      : {};

  return {

    /**
     * =====================================================
     * IDENTIFIERS
     * =====================================================
     */

    id:

      safeString(

        safeTransaction.id ||

        safeTransaction.transaction_id ||

        crypto.randomUUID()

      ),

    code:

      safeString(

        safeTransaction.code ||

        safeTransaction.order_code

      ),

    /**
     * =====================================================
     * TYPE
     * =====================================================
     */

    type:

      normalizeTransactionType(

        safeTransaction.type

      ),

    /**
     * =====================================================
     * VALUES
     * =====================================================
     */

    amount:

      safeNumber(
        safeTransaction.amount
      ),

    points:

      safeNumber(
        safeTransaction.points
      ),

    balanceAfter:

      safeNumber(

        safeTransaction.balance_after

      ),

    /**
     * =====================================================
     * CONTENT
     * =====================================================
     */

    description:

      safeString(

        safeTransaction.description

      ),

    /**
     * =====================================================
     * TIME
     * =====================================================
     */

    createdAt:

      safeDate(

        safeTransaction.created_at

      ),

    /**
     * =====================================================
     * FLAGS
     * =====================================================
     */

    realtime:
      safeBoolean(
        safeTransaction.realtime
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
      safeTransaction,

  };

}

/**
 * =========================================================
 * NORMALIZE TRANSACTIONS
 * =========================================================
 */

export function
normalizeTransactions(
  response
) {

  const transactions =

    response?.transactions ||

    response?.data ||

    response ||

    [];

  return safeArray(
    transactions
  )
    .map(
      normalizeTransaction
    )
    .filter(
      (transaction) =>
        Boolean(
          transaction.id
        )
    );

}