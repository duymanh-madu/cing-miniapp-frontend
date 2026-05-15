import AppShell from "./AppShell";

import AppHeader from "@/components/header/AppHeader";

import BottomNavigation from "@/components/navigation/BottomNavigation";

function AppLayout({
  children,
}) {
  return (
    <AppShell>
      <div
        className="
          min-h-screen
          flex
          flex-col
        "
      >
        <AppHeader />

        <main
          className="
            flex-1
            pb-24
          "
        >
          {children}
        </main>

        <BottomNavigation />
      </div>
    </AppShell>
  );
}

export default AppLayout;