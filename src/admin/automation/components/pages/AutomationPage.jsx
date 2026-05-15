import {
  useEffect,
} from "react";

import automationBootstrap from "../automationBootstrap";

import automationRealtimeSocket from "../automationRealtimeSocket";

import useAutomationStore from "../automationStore";

import AutomationMetricsGrid from "../components/AutomationMetricsGrid";

import WorkflowBuilderForm from "../components/WorkflowBuilderForm";

import WorkflowExecutionFeed from "../components/WorkflowExecutionFeed";

function AutomationPage() {

  const {

    automationMetrics,

    executions,

  } = useAutomationStore();

  useEffect(() => {

    automationBootstrap
      .bootstrap();

    automationRealtimeSocket
      .initialize();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Automation Operating Platform
      </div>

      <AutomationMetricsGrid
        metrics={
          automationMetrics
        }
      />

      <WorkflowBuilderForm />

      <WorkflowExecutionFeed
        executions={
          executions
        }
      />

    </div>

  );

}

export default
  AutomationPage;