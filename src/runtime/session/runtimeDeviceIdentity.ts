const INSTALLATION_ID_STORAGE_KEY =
  "cing_installation_id";

function createInstallationId(): string {
  return crypto.randomUUID();
}

export function getOrCreateRuntimeDeviceId(): string {
  try {
    const existing =
      localStorage.getItem(
        INSTALLATION_ID_STORAGE_KEY
      );

    if (
      existing &&
      existing.trim().length >= 16
    ) {
      return existing.trim();
    }

    const installationId =
      createInstallationId();

    localStorage.setItem(
      INSTALLATION_ID_STORAGE_KEY,
      installationId
    );

    return installationId;
  } catch {
    // Storage có thể bị WebView chặn/mất.
    // Backend vẫn chống duplicate tuyệt đối theo player/user_id.
    return createInstallationId();
  }
}

export function generateRuntimeDeviceId(): string {
  return getOrCreateRuntimeDeviceId();
}
