import {
  AppContainer,
} from "@/components/ui";

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

      {children}

    </AppContainer>

  );
}

export default
  AppLayout;