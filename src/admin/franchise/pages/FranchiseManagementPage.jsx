import {
  useEffect,
} from "react";

import franchiseBootstrap from "../franchiseBootstrap";

import franchiseRealtimeSocket from "../franchiseRealtimeSocket";

import useFranchiseStore from "../franchiseStore";

import FranchiseGrid from "../components/FranchiseGrid";

import RegionalAnalyticsPanel from "../components/RegionalAnalyticsPanel";

function FranchiseManagementPage() {

  const {

    franchises,

    franchiseAnalytics,

  } = useFranchiseStore();

  useEffect(() => {

    franchiseBootstrap
      .bootstrap();

    franchiseRealtimeSocket
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
        Franchise Operating Platform
      </div>

      <FranchiseGrid
        franchises={
          franchises
        }
      />

      <RegionalAnalyticsPanel
        analytics={
          franchiseAnalytics
        }
      />

    </div>

  );

}

export default
  FranchiseManagementPage;