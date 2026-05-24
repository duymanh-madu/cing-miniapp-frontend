import httpClient from "@/api/client/httpClient";

/**
 * =========================================================
 * LOYALTY ENDPOINTS
 * =========================================================
 */

const LOYALTY_ENDPOINTS = {

  MEMBERSHIP:
    "/api/loyalty/membership",

  TRANSACTIONS:
    "/api/loyalty/transactions",

  LEADERBOARD:
    "/api/loyalty/leaderboard",

};

/**
 * =========================================================
 * SAFE USER ID
 * =========================================================
 */

function normalizeUserId(
  userId
) {

  return String(
    userId || ""
  ).trim();

}

/**
 * =========================================================
 * EXTRACT DATA
 * =========================================================
 */

function extractData(
  response
) {

  return (

    response?.data?.data ||

    response?.data ||

    null

  );

}

/**
 * =========================================================
 * BUILD PAGINATION PARAMS
 * =========================================================
 */

function buildPaginationParams({

  page = 1,
  limit = 20,

} = {}) {

  return {

    page,

    limit,

  };

}

/**
 * =========================================================
 * MEMBERSHIP DETAIL
 * =========================================================
 */

export async function
getMembershipDetail({

  userId,
  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * USER ID
     * =====================================================
     */

    const normalizedUserId =

      normalizeUserId(
        userId
      );

    if (
      !normalizedUserId
    ) {

      return null;

    }

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =

      await httpClient.get(

        `${LOYALTY_ENDPOINTS.MEMBERSHIP}/${normalizedUserId}`,

        {
          signal,
        }

      );

    /**
     * =====================================================
     * DATA
     * =====================================================
     */

    const data =
      extractData(
        response
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 MEMBERSHIP DETAIL FETCHED",
      {
        userId:
          normalizedUserId,
      }
    );

    return {

      ...data,

      fetchedAt:
        Date.now(),

      syncSource:
        "api",

    };

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ MEMBERSHIP DETAIL ERROR",
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
 * MEMBER TRANSACTIONS
 * =========================================================
 */

export async function
getMemberTransactions({

  userId,

  page = 1,

  limit = 20,

  type,

  signal,

} = {}) {

  try {

    /**
     * =====================================================
     * USER ID
     * =====================================================
     */

    const normalizedUserId =

      normalizeUserId(
        userId
      );

    if (
      !normalizedUserId
    ) {

      return [];

    }

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =

      await httpClient.get(

        `${LOYALTY_ENDPOINTS.TRANSACTIONS}/${normalizedUserId}`,

        {

          signal,

          params: {

            ...buildPaginationParams({

              page,
              limit,

            }),

            type,

          },

        }

      );

    /**
     * =====================================================
     * DATA
     * =====================================================
     */

    const data =
      extractData(
        response
      );

    /**
     * =====================================================
     * TRANSACTIONS
     * =====================================================
     */

    const transactions =

      Array.isArray(
        data
      )

        ? data

        : data?.transactions || [];

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 MEMBER TRANSACTIONS FETCHED",
      {

        userId:
          normalizedUserId,

        total:
          transactions.length,

        page,

        limit,

      }
    );

    return transactions.map(
      (transaction) => ({

        ...transaction,

        fetchedAt:
          Date.now(),

        syncSource:
          "api",

      })
    );

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ MEMBER TRANSACTIONS ERROR",
      {

        userId,

        message:
          error.message,

      }
    );

    return [];

  }

}

/**
 * =========================================================
 * LOYALTY LEADERBOARD
 * =========================================================
 */

export async function
getLoyaltyLeaderboard({

  limit = 10,

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

        LOYALTY_ENDPOINTS.LEADERBOARD,

        {

          signal,

          params: {
            limit,
          },

        }

      );

    /**
     * =====================================================
     * DATA
     * =====================================================
     */

    const data =
      extractData(
        response
      );

    const leaderboard =

      Array.isArray(
        data
      )

        ? data

        : data?.leaderboard || [];

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 LOYALTY LEADERBOARD FETCHED",
      {

        total:
          leaderboard.length,

      }
    );

    return leaderboard.map(
      (member) => ({

        ...member,

        fetchedAt:
          Date.now(),

        syncSource:
          "api",

      })
    );

  } catch (error) {

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    console.error(
      "❌ LOYALTY LEADERBOARD ERROR",
      {

        message:
          error.message,

      }
    );

    return [];

  }

}