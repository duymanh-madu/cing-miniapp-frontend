import { runtimeOptimizer } from "./runtimeOptimizer";
import { predictiveEngine } from "./predictiveEngine";

class AutoOptimizer {

  evaluateSystem(load: number, errorRate: number) {

    const prediction = predictiveEngine.predictLoad(load);
    const risk = predictiveEngine.predictFailure(errorRate);

    const analysis = runtimeOptimizer.analyze();

    return {
      prediction,
      risk,
      analysis,
      recommendation:
        prediction === "SCALE_UP"
          ? "Increase resources"
          : prediction === "SCALE_DOWN"
          ? "Reduce background jobs"
          : "Maintain current state",
    };

  }

}

export const autoOptimizer = new AutoOptimizer();
