export function getPerformanceSnapshot() {
  return {
    memory:
      performance.memory ||
      null,

    timing:
      performance.timing ||
      null,

    navigation:
      performance
        .navigation ||
      null,

    capturedAt:
      Date.now(),
  };
}