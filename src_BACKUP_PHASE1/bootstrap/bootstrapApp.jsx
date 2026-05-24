import AppBootstrapGate from "./components/AppBootstrapGate";

import AppStartupBoundary from "./components/AppStartupBoundary";

export function bootstrapApp(
  App
) {

  return (

    <AppStartupBoundary>

      <AppBootstrapGate>

        <App />

      </AppBootstrapGate>

    </AppStartupBoundary>

  );

}