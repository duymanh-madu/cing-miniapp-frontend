import React from "react";
import { useRuntimeStatus } from "../hooks/useRuntimeStatus";

export default function ControlPlaneDashboard() {

  const status = useRuntimeStatus();

  return (
    <div style={{ padding: 20 }}>

      <h1>Control Plane Dashboard</h1>

      <div style={{
        marginTop: 20,
        padding: 16,
        border: "1px solid #333",
        borderRadius: 12,
      }}>

        <p>Uptime: {Math.round(status.uptime || 0)} ms</p>
        <p>Active Modules: {status.modules}</p>
        <p>Status: {status.healthy ? "HEALTHY" : "DEGRADED"}</p>

      </div>

    </div>
  );
}
