import {
  useEffect,
} from "react";

import {
  runtimeOrchestrator,
} from "@/runtime/orchestrator";

import observabilityRuntimeModule from "../observabilityRuntimeModule";

import useObservabilityStore from "../observabilityStore";

import SystemHealthGrid from "../components/SystemHealthGrid";

import RealtimeLogsFeed from "../components/RealtimeLogsFeed";

import IncidentCenter from "../components/IncidentCenter";

function ObservabilityPage() {

  const {

    realtimeLogs,

    systemHealth,

    activeIncidents,

  } = useObservabilityStore();

  useEffect(() => {

    runtimeOrchestrator.register(
      observabilityRuntimeModule
    );

    runtimeOrchestrator.activate(
      "admin.observability",
      {
        source:
          "ObservabilityPage",
        route:
          "/admin/observability",
      }
    );

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
        Observability Platform
      </div>

      <SystemHealthGrid
        systemHealth={
          systemHealth
        }
      />

      <IncidentCenter
        incidents={
          activeIncidents
        }
      />

      <RealtimeLogsFeed
        logs={
          realtimeLogs
        }
      />

    </div>

  );

}

export default
  ObservabilityPage;