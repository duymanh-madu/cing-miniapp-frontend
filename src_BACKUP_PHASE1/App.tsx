import AppProvider from "@/providers/AppProvider";

import RuntimeProvider from "@/providers/RuntimeProvider";

import AppBootstrapGate from "@/bootstrap/components/AppBootstrapGate";

import AppRouter from "@/router/AppRouter";

/**
 * =====================================================
 * ENTERPRISE APP ROOT
 * =====================================================
 * ZALO WEBVIEW FIRST
 * MOBILE FIRST
 * REALTIME GOVERNED
 * ENTERPRISE RUNTIME
 * =====================================================
 */

export default function App() {

  return (

    <AppProvider>

      <RuntimeProvider>

        <AppBootstrapGate>

          <AppRouter />

        </AppBootstrapGate>

      </RuntimeProvider>

    </AppProvider>

  );

}