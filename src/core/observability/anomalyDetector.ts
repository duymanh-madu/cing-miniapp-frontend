class AnomalyDetector {

  private thresholds = {
    slowExecutionMs: 2000,
  };

  detectExecution(module: string, duration: number) {

    if (duration > this.thresholds.slowExecutionMs) {
      return {
        type: "SLOW_MODULE",
        module,
        duration,
      };
    }

    return null;
  }

}

export const anomalyDetector = new AnomalyDetector();
