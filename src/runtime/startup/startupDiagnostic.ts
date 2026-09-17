export type StartupDiagnosticMark = {
  name: string;
  at: number;
};

declare global {
  interface Window {
    __cingStartupDiagnostic?: {
      enabled: boolean;
      marks: StartupDiagnosticMark[];
    };
  }
}

const STARTUP_DIAGNOSTIC_STORAGE_KEY =
  "cing_startup_diagnostic";

function diagnosticEnabled() {
  try {
    const requested =
      new URLSearchParams(
        window.location.search
      ).get("startup_diag");

    if (requested === "1") {
      localStorage.setItem(
        STARTUP_DIAGNOSTIC_STORAGE_KEY,
        "1"
      );

      return true;
    }

    if (requested === "0") {
      localStorage.removeItem(
        STARTUP_DIAGNOSTIC_STORAGE_KEY
      );

      return false;
    }

    return (
      localStorage.getItem(
        STARTUP_DIAGNOSTIC_STORAGE_KEY
      ) === "1"
    );
  } catch {
    return false;
  }
}

function state() {
  if (!window.__cingStartupDiagnostic) {
    window.__cingStartupDiagnostic = {
      enabled: diagnosticEnabled(),
      marks: [],
    };
  }

  return window.__cingStartupDiagnostic;
}

export function markStartup(
  name: string
) {
  const current = state();

  if (!current.enabled) {
    return;
  }

  current.marks.push({
    name,
    at: performance.now(),
  });

  window.dispatchEvent(
    new Event("cing:startup-diagnostic")
  );
}

export function getStartupDiagnostic() {
  return state();
}

export function armStartupDiagnostic() {
  try {
    localStorage.setItem(
      STARTUP_DIAGNOSTIC_STORAGE_KEY,
      "1"
    );
  } catch {
    return false;
  }

  const current = state();
  current.enabled = true;

  window.dispatchEvent(
    new Event("cing:startup-diagnostic")
  );

  return true;
}
