import {
  reportError,
} from "./reportError";

export function useErrorBoundary(
  error
) {

  return reportError(
    error
  );

}