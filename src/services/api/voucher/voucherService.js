import {
  getMemberVouchers,
  getAvailableVouchers,
  getClaimedVouchers,
  getVoucherDetail,
} from "./voucherApi";

import {
  normalizeVoucher,
  normalizeVoucherResponse,
} from "./voucherMapper";

import {
  resolveHttpError,
} from "@/services/http/httpErrorHandler";

/**
 * =========================================================
 * SERVICE SOURCE
 * =========================================================
 */

const SERVICE_SOURCE =
  "voucher-service";

/**
 * =========================================================
 * BUILD SERVICE METADATA
 * =========================================================
 */

function buildServiceMetadata({

  operation,
  startedAt,

  extra = {},

}) {

  return {

    operation,

    duration:
      `${Date.now() - startedAt}ms`,

    timestamp:
      Date.now(),

    source:
      SERVICE_SOURCE,

    ...extra,

  };

}

/**
 * =========================================================
 * VALIDATE USER ID
 * =========================================================
 */

function validateUserId(
  userId
) {

  if (
    !userId
  ) {

    throw {

      message:
        "Missing userId",

      status:
        400,

    };

  }

}

/**
 * =========================================================
 * VALIDATE VOUCHER ID
 * =========================================================
 */

function validateVoucherId(
  voucherId
) {

  if (
    !voucherId
  ) {

    throw {

      message:
        "Missing voucherId",

      status:
        400,

    };

  }

}

/**
 * =========================================================
 * HANDLE SERVICE ERROR
 * =========================================================
 */

function handleServiceError({

  operation,
  error,
  extra,

}) {

  const parsedError =
    resolveHttpError(
      error
    );

  console.error(
    `❌ ${operation.toUpperCase()} FAILED`,
    {

      ...extra,

      error:
        parsedError,

    }
  );

  throw parsedError;

}

/**
 * =========================================================
 * FETCH MEMBER VOUCHERS
 * =========================================================
 */

export async function
fetchMemberVouchers({

  userId,

  status,

  type,

  page = 1,

  limit = 50,

  signal,

}) {

  validateUserId(
    userId
  );

  const startedAt =
    Date.now();

  try {

    /**
     * =====================================================
     * OBSERVABILITY
     * =====================================================
     */

    console.log(
      "🎟️ FETCH MEMBER VOUCHERS",
      buildServiceMetadata({

        operation:
          "fetch-member-vouchers",

        startedAt,

        extra: {

          userId,

          status,

          type,

        },

      })
    );

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =
      await getMemberVouchers({

        userId,

        status,

        type,

        page,

        limit,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const vouchers =
      normalizeVoucherResponse(
        response
      );

    /**
     * =====================================================
     * METRICS
     * =====================================================
     */

    const usable =
      vouchers.filter(
        (
          voucher
        ) =>
          voucher.usable
      ).length;

    const expired =
      vouchers.filter(
        (
          voucher
        ) =>
          voucher.expired
      ).length;

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 MEMBER VOUCHERS READY",
      buildServiceMetadata({

        operation:
          "member-vouchers-ready",

        startedAt,

        extra: {

          userId,

          total:
            vouchers.length,

          usable,

          expired,

        },

      })
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return vouchers;

  } catch (error) {

    handleServiceError({

      operation:
        "fetch member vouchers",

      error,

      extra: {

        userId,

      },

    });

  }

}

/**
 * =========================================================
 * FETCH AVAILABLE VOUCHERS
 * =========================================================
 */

export async function
fetchAvailableVouchers({

  page = 1,

  limit = 50,

  signal,

} = {}) {

  const startedAt =
    Date.now();

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =
      await getAvailableVouchers({

        page,

        limit,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const vouchers =
      normalizeVoucherResponse(
        response
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 AVAILABLE VOUCHERS READY",
      buildServiceMetadata({

        operation:
          "available-vouchers-ready",

        startedAt,

        extra: {

          total:
            vouchers.length,

        },

      })
    );

    return vouchers;

  } catch (error) {

    handleServiceError({

      operation:
        "fetch available vouchers",

      error,

    });

  }

}

/**
 * =========================================================
 * FETCH CLAIMED VOUCHERS
 * =========================================================
 */

export async function
fetchClaimedVouchers({

  page = 1,

  limit = 50,

  signal,

} = {}) {

  const startedAt =
    Date.now();

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =
      await getClaimedVouchers({

        page,

        limit,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const vouchers =
      normalizeVoucherResponse(
        response
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 CLAIMED VOUCHERS READY",
      buildServiceMetadata({

        operation:
          "claimed-vouchers-ready",

        startedAt,

        extra: {

          total:
            vouchers.length,

        },

      })
    );

    return vouchers;

  } catch (error) {

    handleServiceError({

      operation:
        "fetch claimed vouchers",

      error,

    });

  }

}

/**
 * =========================================================
 * FETCH VOUCHER DETAIL
 * =========================================================
 */

export async function
fetchVoucherDetail({

  voucherId,

  signal,

}) {

  validateVoucherId(
    voucherId
  );

  const startedAt =
    Date.now();

  try {

    /**
     * =====================================================
     * API
     * =====================================================
     */

    const response =
      await getVoucherDetail({

        voucherId,

        signal,

      });

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const voucher =
      normalizeVoucher(
        response
      );

    /**
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "🟢 VOUCHER DETAIL READY",
      buildServiceMetadata({

        operation:
          "voucher-detail-ready",

        startedAt,

        extra: {

          voucherId,

          status:
            voucher.status,

        },

      })
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return voucher;

  } catch (error) {

    handleServiceError({

      operation:
        "fetch voucher detail",

      error,

      extra: {

        voucherId,

      },

    });

  }

}