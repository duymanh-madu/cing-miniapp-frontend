let initialized =
  false;

export function registerGlobalErrorHandlers() {
  if (initialized) {
    return;
  }

  initialized = true;

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      console.error(
        "UNHANDLED PROMISE",
        event.reason
      );
    }
  );

  window.addEventListener(
    "error",
    (event) => {
      console.error(
        "GLOBAL ERROR",
        event.error
      );
    }
  );
}