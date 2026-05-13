import toast from "react-hot-toast";

import {
  resolveHttpError,
} from "./httpErrorHandler";

/**
 * ============================================
 * HANDLE HTTP ERROR
 * ============================================
 */

export function handleHttpError(
  error
) {
  const parsed =
    resolveHttpError(
      error
    );

  toast.error(
    parsed.message
  );

  return parsed;
}