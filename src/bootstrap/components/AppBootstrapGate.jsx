import { useEffect } from "react";
import { initializeApplication } from "../services/appBootstrapOrchestrator";

/**
 * Application rendering must not be blocked by network/runtime bootstrap.
 *
 * Runtime bootstrap remains single-owner and fully governed by
 * initializeApplication(), but Home/router may render immediately while
 * identity/session/data hydrate asynchronously.
 *
 * Individual features already own their loading/enabled states and must
 * not depend on a global full-screen startup gate.
 */
function AppBootstrapGate({ children }) {
  useEffect(() => {
    void initializeApplication();
  }, []);

  return children;
}

export default AppBootstrapGate;
