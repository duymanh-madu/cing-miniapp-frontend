function getViewportSize() {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      width: 0,
      height: 0,
    };
  }

  return {
    width:
      window.visualViewport
        ?.width ||
      window.innerWidth ||
      0,

    height:
      window.visualViewport
        ?.height ||
      window.innerHeight ||
      0,
  };
}


export function
isCingArtilleryLandscapeViewport() {
  const {
    width,
    height,
  } =
    getViewportSize();

  return (
    width > 0 &&
    height > 0 &&
    width > height
  );
}


async function
tryEnterFullscreen() {
  if (
    typeof document ===
    "undefined"
  ) {
    return false;
  }

  if (
    document.fullscreenElement
  ) {
    return true;
  }

  const element =
    document.documentElement;

  const request =
    element?.requestFullscreen;

  if (
    typeof request !==
    "function"
  ) {
    return false;
  }

  try {
    await request.call(
      element
    );

    return Boolean(
      document.fullscreenElement
    );
  } catch {
    /*
     * Zalo WebView / iOS may reject
     * fullscreen. Landscape still works
     * when the user rotates the device.
     */
    return false;
  }
}


async function
tryLockLandscape() {
  if (
    typeof screen ===
      "undefined" ||
    typeof screen.orientation
      ?.lock !==
      "function"
  ) {
    return false;
  }

  try {
    await screen.orientation
      .lock(
        "landscape"
      );

    return true;
  } catch {
    /*
     * Orientation locking is a progressive
     * enhancement only. Never fake rotation
     * with CSS because gameplay pointer
     * coordinates must remain canonical.
     */
    return false;
  }
}


export async function
requestCingArtilleryLandscapeMode() {
  const fullscreen =
    await tryEnterFullscreen();

  const orientationLocked =
    await tryLockLandscape();

  return {
    fullscreen,
    orientationLocked,
    landscape:
      isCingArtilleryLandscapeViewport(),
  };
}
