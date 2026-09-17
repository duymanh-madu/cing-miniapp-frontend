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

function diagnosticEnabled() {
  try {
    return new URLSearchParams(
      window.location.search
    ).get("startup_diag") === "1";
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
