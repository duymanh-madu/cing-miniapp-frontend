/**
 * ============================================
 * HTTP ERROR HANDLER
 * ============================================
 */

export function resolveHttpError(
  error
) {
  /**
   * NETWORK
   */

  if (!error.response) {
    return {
      message:
        "Mất kết nối mạng",

      status: 0,
    };
  }

  /**
   * SERVER
   */

  return {
    message:
      error.response.data
        ?.message ||
      "Có lỗi xảy ra",

    status:
      error.response.status,
  };
}