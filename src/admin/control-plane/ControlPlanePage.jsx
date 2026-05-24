import { apiGraphEngine } from "@/runtime/control-plane/apiGraphEngine";

export default function ControlPlanePage() {

  const graph = apiGraphEngine.buildGraph();

  return (
    <div style={{ padding: 20 }}>

      <h2>🚀 API CONTROL PLANE</h2>

      <div>
        <h3>APIs: {graph.meta.totalApis}</h3>
        <h3>Events: {graph.meta.totalEvents}</h3>
      </div>

      <pre style={{ background: "#111", color: "#0f0", padding: 20 }}>
        {JSON.stringify(graph, null, 2)}
      </pre>

    </div>
  );
}
