import {

  getMembershipDetail,

  getMemberTransactions,

  getLoyaltyLeaderboard,

} from "./loyaltyApi";

import {

  normalizeMembership,

  normalizeTransactions,

  TRANSACTION_TYPES,

} from "./loyaltyMapper";

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
 * SORT TRANSACTIONS
 * =========================================================
 */

function sortTransactions(
  transactions = []
) {

  return [...transactions].sort(

    (
      a,
      b
    ) => {

      const aDate =
        new Date(
          a.createdAt || 0
        ).getTime();

      const bDate =
        new Date(
          b.createdAt || 0
        ).getTime();

      return bDate - aDate;

    }

  );

}

/**
 * =========================================================
 * FILTER TRANSACTION TYPE
 * =========================================================
 */

function filterTransactionsByType({

  transactions,
  type,

}) {

  if (!type) {

    return transactions;

  }

  return transactions.filter(
    (transaction) =>

      transaction.type ===
      type
  );

}

/**
 * =========================================================
 * BUILD LOYALTY ANALYTICS
 * =========================================================
 */

function buildTransactionAnalytics(
  transactions = []
) {

  let totalEarned =
    0;

  let totalRedeemed =
    0;

  let totalBonus =
    0;

  transactions.forEach(
    (transaction) => {

      switch (
        transaction.type
      ) {

        case
          TRANSACTION_TYPES.EARN:

          totalEarned +=
            transaction.points;

          break;

        case
          TRANSACTION_TYPES.REDEEM:

          totalRedeemed +=
            transaction.points;

          break;

        case
          TRANSACTION_TYPES.BONUS:

          totalBonus +=
            transaction.points;

          break;

        default:
          break;

      }

    }
  );

  return {

    totalEarned,

    totalRedeemed,

    totalBonus,

    transactionCount:
      transactions.length,

  };

}

/**
 * =========================================================
 * FETCH MEMBERSHIP
 * =========================================================
 */

export async function
fetchMembership({

  userId,
  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =

      await getMembershipDetail({

        userId,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const membership =

      normalizeMembership(
        response
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 MEMBERSHIP FETCHED",
      {

        userId:
          membership.id,

        level:
          membership.level,

      }
    );

    return membership;

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ FETCH MEMBERSHIP ERROR",
      {

        userId,

        message:
          error.message,

      }
    );

    return null;

  }

}

/**
 * =========================================================
 * FETCH TRANSACTIONS
 * =========================================================
 */

export async function
fetchTransactions({

  userId,

  page = 1,

  limit = 20,

  type,

  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =

      await getMemberTransactions({

        userId,

        page,

        limit,

        type,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    let transactions =

      normalizeTransactions(
        response
      );

    transactions =
      safeArray(
        transactions
      );

    /**
     * =====================================================
     * FILTER TYPE
     * =====================================================
     */

    transactions =
      filterTransactionsByType({

        transactions,

        type,

      });

    /**
     * =====================================================
     * SORT
     * =====================================================
     */

    transactions =
      sortTransactions(
        transactions
      );

    /**
     * =====================================================
     * ANALYTICS
     * =====================================================
     */

    const analytics =

      buildTransactionAnalytics(
        transactions
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 TRANSACTIONS FETCHED",
      {

        userId,

        total:
          transactions.length,

      }
    );

    return {

      transactions,

      analytics,

      pagination: {

        page,

        limit,

        hasMore:

          transactions.length >=
          limit,

      },

    };

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ FETCH TRANSACTIONS ERROR",
      {

        userId,

        message:
          error.message,

      }
    );

    return {

      transactions: [],

      analytics: {

        totalEarned: 0,

        totalRedeemed: 0,

        totalBonus: 0,

        transactionCount: 0,

      },

      pagination: {

        page,

        limit,

        hasMore: false,

      },

    };

  }

}

/**
 * =========================================================
 * FETCH LEADERBOARD
 * =========================================================
 */

export async function
fetchLeaderboard({

  limit = 10,

  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =

      await getLoyaltyLeaderboard({

        limit,

        signal,

      });

    /**
     * =====================================================
     * SORT
     * =====================================================
     */

    const leaderboard =

      safeArray(
        response
      ).sort(

        (
          a,
          b
        ) =>

          (b.points || 0) -

          (a.points || 0)

      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 LEADERBOARD FETCHED",
      {

        total:
          leaderboard.length,

      }
    );

    return leaderboard;

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ FETCH LEADERBOARD ERROR",
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
 * FETCH EARN TRANSACTIONS
 * =========================================================
 */

export async function
fetchEarnTransactions(
  options = {}
) {

  return fetchTransactions({

    ...options,

    type:
      TRANSACTION_TYPES.EARN,

  });

}

/**
 * =========================================================
 * FETCH REDEEM TRANSACTIONS
 * =========================================================
 */

export async function
fetchRedeemTransactions(
  options = {}
) {

  return fetchTransactions({

    ...options,

    type:
      TRANSACTION_TYPES.REDEEM,

  });

}