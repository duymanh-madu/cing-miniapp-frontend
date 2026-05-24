import React from "react";
import { autonomousController } from "../../../core/autonomous/autonomousController";

export default function AutonomousPanel() {

  const decision = autonomousController.execute({
    revenue: 500000,
    errorRate: 0.1,
    load: 65,
  });

  return (
    <div style={{ marginTop: 20 }}>

      <h2>Autonomous System</h2>

      <pre style={{
        background: "#000",
        color: "#0f0",
        padding: 12
      }}>
        {JSON.stringify(decision, null, 2)}
      </pre>

    </div>
  );
}
