import {
  useEffect,
} from "react";

import ecosystemBootstrap from "../ecosystemBootstrap";

import ecosystemRealtimeSocket from "../ecosystemRealtimeSocket";

import useEcosystemStore from "../ecosystemStore";

import EcosystemAppsGrid from "../components/EcosystemAppsGrid";

import FederationRuntimeViewer from "../components/FederationRuntimeViewer";

function EcosystemPlatformPage() {

  const {

    ecosystemApps,

    federationRuntime,

  } = useEcosystemStore();

  useEffect(() => {

    ecosystemBootstrap
      .bootstrap();

    ecosystemRealtimeSocket
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
        Ecosystem Operating Platform
      </div>

      <EcosystemAppsGrid
        apps={
          ecosystemApps
        }
      />

      <FederationRuntimeViewer
        federationRuntime={
          federationRuntime
        }
      />

    </div>

  );

}

export default
  EcosystemPlatformPage;