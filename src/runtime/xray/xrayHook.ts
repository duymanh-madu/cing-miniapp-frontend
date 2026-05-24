import { traceCollector } from "./traceCollector";

export function traceApi(event: string, fn: Function) {

  return function (...args: any[]) {

    const trace = traceCollector.start(event, { args });

    try {

      const result = fn(...args);

      traceCollector.step(trace, "EXECUTION", result);

      traceCollector.end(trace);

      return result;

    } catch (err) {

      traceCollector.step(trace, "ERROR", err);
      traceCollector.end(trace);

      throw err;

    }

  };

}
