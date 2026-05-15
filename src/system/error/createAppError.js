export function createAppError({
  code = "UNKNOWN_ERROR",
  message = "Something went wrong",
  status = 500,
  metadata = null,
}) {
  return {

    code,

    message,

    status,

    metadata,

    timestamp:
      Date.now(),

  };
}