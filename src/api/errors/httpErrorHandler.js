export function createHttpError({
  message = "HTTP request failed",
  status = 500,
  code = "HTTP_ERROR",
  details = null,
  originalError = null,
} = {}) {
  const error = new Error(message);

  error.name = "HttpError";
  error.status = status;
  error.code = code;
  error.details = details;
  error.originalError = originalError;
  error.isHttpError = true;

  return error;
}

export function resolveHttpError(error) {
  const response = error?.response;

  if (response) {
    return createHttpError({
      message:
        response?.data?.message ||
        response?.data?.error ||
        error?.message ||
        "HTTP response error",
      status: response?.status || 500,
      code:
        response?.data?.code ||
        response?.statusText ||
        "HTTP_RESPONSE_ERROR",
      details: response?.data || null,
      originalError: error,
    });
  }

  if (error?.request) {
    return createHttpError({
      message: "Network request failed",
      status: 0,
      code: "NETWORK_ERROR",
      details: null,
      originalError: error,
    });
  }

  return createHttpError({
    message: error?.message || "Unexpected HTTP error",
    status: 500,
    code: "UNKNOWN_HTTP_ERROR",
    details: null,
    originalError: error,
  });
}
