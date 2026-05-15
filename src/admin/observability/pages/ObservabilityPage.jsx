import {
  useEffect,
} from "react";

import observabilityBootstrap from "../observabilityBootstrap";

import observabilityRealtimeSocket from "../observabilityRealtimeSocket";

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

    observabilityBootstrap
      .bootstrap();

    observabilityRealtimeSocket
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