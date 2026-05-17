import {
  memo,
} from "react";

import BottomNavigation from "./BottomNavigation";

function AppShell({

  children,

}) {

  return (

    <div
      className="

        min-h-screen

        bg-[#f5f7fb]

      "
    >

      <main
        className="

          pb-24

        "
      >

        {children}

      </main>

      <BottomNavigation />

    </div>

  );

}

export default memo(
  AppShell
);