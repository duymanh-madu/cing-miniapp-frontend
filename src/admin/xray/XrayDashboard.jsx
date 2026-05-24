import { traceCollector } from "@/runtime/xray/traceCollector";

export default function XrayDashboard() {

  const traces = traceCollector.getAll();

  return (
    <div style={{ padding: 20 }}>

      <h2>🧠 SYSTEM XRAY V2</h2>

      <div>
        <h3>Total Traces: {traces.length}</h3>
      </div>

      {traces.map((t, i) => (
        <div key={i} style={{ marginBottom: 20 }}>

          <h4>📌 {t.event}</h4>
          <p>Duration: {t.duration}ms</p>

          <pre style={{ background: "#111", color: "#0f0" }}>
            {JSON.stringify(t.steps, null, 2)}
          </pre>

        </div>
      ))}

    </div>
  );
}
