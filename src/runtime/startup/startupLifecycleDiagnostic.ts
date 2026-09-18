export type StartupLifecycleDiagnosticEvent = {
  event: string;
  at: number;
  visibility: string;
};

const STORAGE_KEY =
  "cing_startup_lifecycle_trace_v1";

const MAX_EVENTS = 80;

let installed = false;

function readStored():
  StartupLifecycleDiagnosticEvent[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    const parsed =
      raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function recordStartupLifecycleEvent(
  event: string
) {
  try {
    const next = [
      ...readStored(),
      {
        event,
        at: Date.now(),
        visibility:
          document.visibilityState ||
          "unknown",
      },
    ].slice(-MAX_EVENTS);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new Event(
        "cing:startup-lifecycle-diagnostic"
      )
    );
  } catch {
    // Diagnostic must never affect runtime.
  }
}

export function getStartupLifecycleTrace() {
  return readStored();
}

export function clearStartupLifecycleTrace() {
  try {
    localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new Event(
        "cing:startup-lifecycle-diagnostic"
      )
    );
  } catch {
    // Diagnostic only.
  }
}

export function installStartupLifecycleDiagnostic() {
  if (installed) {
    return;
  }

  installed = true;

  recordStartupLifecycleEvent(
    "main-entry"
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      recordStartupLifecycleEvent(
        document.visibilityState === "hidden"
          ? "visibility:hidden"
          : "visibility:visible"
      );
    }
  );

  window.addEventListener(
    "focus",
    () => {
      recordStartupLifecycleEvent(
        "window:focus"
      );
    }
  );

  window.addEventListener(
    "blur",
    () => {
      recordStartupLifecycleEvent(
        "window:blur"
      );
    }
  );

  window.addEventListener(
    "pageshow",
    () => {
      recordStartupLifecycleEvent(
        "window:pageshow"
      );
    }
  );

  window.addEventListener(
    "pagehide",
    () => {
      recordStartupLifecycleEvent(
        "window:pagehide"
      );
    }
  );
}
