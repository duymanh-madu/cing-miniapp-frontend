import {
  AppContainer,
} from "@/components/ui";

import BottomNavigation from "@/components/navigation/BottomNavigation";

/**
 * =========================================================
 * APP LAYOUT
 * =========================================================
 * Zalo WebView mobile-first layout.
 * Bottom navigation is safe-area governed.
 * =========================================================
 */

function AppLayout({
  children,
}) {
  return (

    <AppContainer>

      {children}

      <BottomNavigation />

    </AppContainer>

  );
}

export default
  AppLayout;
