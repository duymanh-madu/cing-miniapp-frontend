class DecisionEngine {

  decide(context: any) {

    const { revenue, errorRate, load } = context;

    if (errorRate > 0.3) {
      return {
        action: "SHUTDOWN_RISK_MODULES",
        reason: "High error rate detected",
      };
    }

    if (load > 80 && revenue > 1000000) {
      return {
        action: "SCALE_INFRASTRUCTURE",
        reason: "High demand + high revenue",
      };
    }

    if (revenue < 100000) {
      return {
        action: "OPTIMIZE_COSTS",
        reason: "Low revenue detected",
      };
    }

    return {
      action: "MAINTAIN",
      reason: "System stable",
    };
  }

}

export const decisionEngine = new DecisionEngine();
