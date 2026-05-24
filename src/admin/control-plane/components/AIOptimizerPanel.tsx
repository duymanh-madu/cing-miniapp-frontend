import React from "react";
import { autoOptimizer } from "../../../core/ai/autoOptimizer";

export default function AIOptimizerPanel() {

  const report = autoOptimizer.evaluateSystem(65, 0.1);

  return (
    <div style={{ marginTop: 20 }}>

      <h2>AI Runtime Optimizer</h2>

      <pre style={{
        background: "#111",
        color: "#0f0",
        padding: 12
      }}>
        {JSON.stringify(report, null, 2)}
      </pre>

    </div>
  );
}
