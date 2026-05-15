import AppRouter from "./AppRouter";

import AppHeader from "./AppHeader";

import BottomTabbar from "./BottomTabbar";

function AppShell() {

  return (
    <div
      className="
        min-h-screen
        bg-[#f8f8f8]
      "
    >
      <AppHeader />

      <main
        className="
          mx-auto
          w-full
          max-w-[640px]
          pb-24
          pt-16
        "
      >
        <AppRouter />
      </main>

      <BottomTabbar />
    </div>
  );

}

export default
  AppShell;