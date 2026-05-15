import {
  AppContainer,
} from "@/components/ui";

import AppHeader
  from "@/components/layout/AppHeader";

import AppSurface
  from "@/components/layout/AppSurface";

import BottomNavigation
  from "@/components/navigation/BottomNavigation";

/**
 * =========================================================
 * APP LAYOUT
 * =========================================================
 */

function AppLayout({
  children,
}) {

  return (

    <AppContainer>

      <AppHeader />

      <AppSurface>

        {children}

      </AppSurface>

      <BottomNavigation />

    </AppContainer>

  );

}

export default
  AppLayout;