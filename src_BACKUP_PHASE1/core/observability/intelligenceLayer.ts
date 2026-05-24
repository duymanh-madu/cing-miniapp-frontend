import { runtimeTracer } from "./runtimeTracer";
import { anomalyDetector } from "./anomalyDetector";
import { selfHealing } from "./selfHealing";

class IntelligenceLayer {

  monitor(module: string, fn: Function) {

    return async (...args: any[]) => {

      const start = performance.now();

      try {

        runtimeTracer.trace(module, "START");

        const result = await fn(...args);

        const duration = performance.now() - start;

        const anomaly = anomalyDetector.detectExecution(module, duration);

        if (anomaly) {
          runtimeTracer.error(module, anomaly);
        }

        runtimeTracer.trace(module, "END", {
          duration,
        });

        return result;

      } catch (error) {

        runtimeTracer.error(module, error);

        selfHealing.disable(module);

        throw error;

      }

    };

  }

}

export const intelligenceLayer = new IntelligenceLayer();
