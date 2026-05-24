import {
  useEffect,
  useState,
} from "react";

import UnifiedLoadingState from "@/ui/components/UnifiedLoadingState";

import {
  initializeApplication,
} from "../services/appBootstrapOrchestrator";

function AppBootstrapGate({

  children,

}) {

  const [

    ready,

    setReady,

  ] = useState(false);

  useEffect(() => {

    async function boot() {

      await initializeApplication();

      setReady(true);

    }

    boot();

  }, []);

  if (!ready) {

    return (

      <UnifiedLoadingState
        label="Starting app"
      />

    );

  }

  return children;

}

export default AppBootstrapGate;