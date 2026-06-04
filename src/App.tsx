import AppProvider from "@/providers/AppProvider";

import RuntimeProvider from "@/providers/RuntimeProvider";

import AppBootstrapGate from "@/bootstrap/components/AppBootstrapGate";

import AppRouter from "@/router/AppRouter";
import ZaloBirthdayGate from "@/app/ZaloBirthdayGate";
import GlobalTicker from "@/features/notification/components/GlobalTicker";
import useNotificationStore from "@/stores/notification/notificationStore";

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
  const initNotifications = useNotificationStore(s => s.init);
  useEffect(() => { initNotifications(); }, []);

  return (

    <AppProvider>

      <RuntimeProvider>

        <AppBootstrapGate>

          <AppRouter />
          <ZaloBirthdayGate />
          <GlobalTicker />

        </AppBootstrapGate>

      </RuntimeProvider>

    </AppProvider>

  );

}