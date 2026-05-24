import {
  createHttpError,
} from "./httpError";

export function resolveHttpError(
  error
) {

  if (
    error?.response
  ) {

    return createHttpError({

      message:

        error.response
          .data?.message ||

        "Request failed",

      status:
        error.response
          .status,

      metadata:
        error.response
          .data,

    });

  }

  return createHttpError({

    message:

      error?.message ||

      "Network error",

    status:
      500,

    metadata:
      error,

  });

}