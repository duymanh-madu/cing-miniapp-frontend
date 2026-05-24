import {
  useEffect,
} from "react";

import runtimeConfigBootstrap from "../runtimeConfigBootstrap";

import useRuntimeConfigStore from "../runtimeConfigStore";

function RemoteConfigPage() {

  const config =
    useRuntimeConfigStore(
      (
        state
      ) => state.config
    );

  useEffect(() => {

    runtimeConfigBootstrap
      .bootstrap();

  }, []);

  return (

    <pre
      className="
        overflow-auto
        rounded-3xl
        bg-zinc-950
        p-6
      "
    >

      {

        JSON.stringify(
          config,
          null,
          2
        )

      }

    </pre>

  );

}

export default
  RemoteConfigPage;