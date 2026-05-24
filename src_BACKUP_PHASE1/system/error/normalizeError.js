import {
  createAppError,
} from "./createAppError";

export function normalizeError(
  error
) {

  if (
    error?.code
  ) {

    return error;

  }

  return createAppError({

    code:
      "UNHANDLED_ERROR",

    message:

      error?.message ||

      "Unexpected error",

    status:

      error?.status ||

      500,

    metadata:
      error,

  });

}