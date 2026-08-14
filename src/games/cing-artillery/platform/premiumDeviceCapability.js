function getWebGLContext() {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");

  return (
    canvas.getContext("webgl2", {
      powerPreference: "high-performance",
    }) ||
    canvas.getContext("webgl", {
      powerPreference: "high-performance",
    }) ||
    null
  );
}

export function detectPremiumDeviceCapability() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return {
      supported: false,
      reason: "RUNTIME_UNAVAILABLE",
    };
  }

  const webgl = getWebGLContext();

  if (!webgl) {
    return {
      supported: false,
      reason: "WEBGL_UNAVAILABLE",
    };
  }

  return {
    supported: true,
    reason: null,
    devicePixelRatio:
      window.devicePixelRatio || 1,
    hardwareConcurrency:
      navigator.hardwareConcurrency || null,
    deviceMemory:
      navigator.deviceMemory || null,
  };
}
