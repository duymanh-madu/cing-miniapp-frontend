class PredictiveEngine {

  predictLoad(currentLoad: number) {

    if (currentLoad > 80) {
      return "SCALE_UP";
    }

    if (currentLoad < 20) {
      return "SCALE_DOWN";
    }

    return "STABLE";
  }

  predictFailure(errorRate: number) {

    if (errorRate > 0.2) {
      return "HIGH_RISK";
    }

    return "NORMAL";
  }

}

export const predictiveEngine = new PredictiveEngine();
