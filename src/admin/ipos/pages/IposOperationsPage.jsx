import {
  useEffect,
} from "react";

import iposBootstrap from "../iposBootstrap";

import iposRealtimeSocket from "../iposRealtimeSocket";

import useIposStore from "../iposStore";

import IposStatusCard from "../components/IposStatusCard";

import IposRealtimeFeed from "../components/IposRealtimeFeed";

function IposOperationsPage() {

  const {

    connectionStatus,

    realtimeSyncEvents,

  } = useIposStore();

  useEffect(() => {

    iposBootstrap
      .bootstrap();

    iposRealtimeSocket
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
        iPOS Realtime Operations
      </div>

      <IposStatusCard
        status={
          connectionStatus
        }
      />

      <IposRealtimeFeed
        events={
          realtimeSyncEvents
        }
      />

    </div>

  );

}

export default
  IposOperationsPage;