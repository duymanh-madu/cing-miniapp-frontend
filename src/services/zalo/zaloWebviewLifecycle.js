let initialized =
  false;

export function initializeZaloWebviewLifecycle() {
  if (initialized) {
    return;
  }

  initialized = true;

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        return;
      }
    }
  );
}