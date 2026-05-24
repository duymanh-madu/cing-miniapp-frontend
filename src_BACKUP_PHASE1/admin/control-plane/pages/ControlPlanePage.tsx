import React from "react";
import ControlPlaneDashboard from "./ControlPlaneDashboard";
import FeatureFlagPanel from "../components/FeatureFlagPanel";
import RuntimeModuleViewer from "../components/RuntimeModuleViewer";
import AIOptimizerPanel from "../components/AIOptimizerPanel";
import AutonomousPanel from "../components/AutonomousPanel";

export default function ControlPlanePage() {

  return (
    <div style={{ padding: 24 }}>

      <h1>ADMIN CONTROL PLANE</h1>

      <div style={{ marginTop: 20 }}>
        <ControlPlaneDashboard />
      </div>

      <div style={{ marginTop: 40 }}>
        <FeatureFlagPanel />
      </div>

      <div style={{ marginTop: 40 }}>
        <RuntimeModuleViewer />
        <AIOptimizerPanel />
        <AutonomousPanel />
import AutonomousPanel from "../components/AutonomousPanel";
import AIOptimizerPanel from "../components/AIOptimizerPanel";
import AutonomousPanel from "../components/AutonomousPanel";
      </div>

    </div>
  );
}
