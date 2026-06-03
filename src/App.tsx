import AppProvider from "@/providers/AppProvider";

import RuntimeProvider from "@/providers/RuntimeProvider";

import AppBootstrapGate from "@/bootstrap/components/AppBootstrapGate";

import AppRouter from "@/router/AppRouter";
import ZaloBirthdayGate from "@/app/ZaloBirthdayGate";
import ZaloOAGate from "@/app/ZaloOAGate";
import GlobalTicker from "@/features/notification/components/GlobalTicker";

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
          <ZaloBirthdayGate />
          <ZaloOAGate />
          <GlobalTicker />

        </AppBootstrapGate>

      </RuntimeProvider>

    </AppProvider>

  );

}