import { apiRegistry } from "../registry/apiRegistry";
import { eventTraceCollector } from "./eventTraceCollector";

class ApiGraphEngine {

  buildGraph() {

    const apis = apiRegistry.getAll();
    const traces = eventTraceCollector.getAll();

    return {
      nodes: apis.map(a => ({
        id: a.name,
        type: "API",
      })),

      edges: traces.map(t => ({
        from: t.event,
        to: "SYSTEM",
      })),

      meta: {
        totalApis: apis.length,
        totalEvents: traces.length,
      }
    };

  }

}

export const apiGraphEngine = new ApiGraphEngine();
