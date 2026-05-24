import {
  normalizeError,
} from "./normalizeError";

import {
  logError,
} from "./errorLogger";

export function reportError(
  error
) {

  const normalized =
    normalizeError(
      error
    );

  logError(
    normalized
  );

  return normalized;

}