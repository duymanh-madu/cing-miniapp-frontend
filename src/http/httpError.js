export function createHttpError({
  message = "Request failed",
  status = 500,
  metadata = null,
}) {

  return {

    message,

    status,

    metadata,

  };

}