import {
  useEffect,
} from "react";

import releaseBootstrap from "../releaseBootstrap";

import useReleaseStore from "../releaseStore";

import ReleaseFeed from "../components/ReleaseFeed";

import EnvironmentGrid from "../components/EnvironmentGrid";

function ReleaseManagementPage() {

  const {

    releases,

    environmentStatus,

  } = useReleaseStore();

  useEffect(() => {

    releaseBootstrap
      .bootstrap();

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
        Release Management
      </div>

      <EnvironmentGrid
        environmentStatus={
          environmentStatus
        }
      />

      <ReleaseFeed
        releases={
          releases
        }
      />

    </div>

  );

}

export default
  ReleaseManagementPage;