import {
  useEffect,
} from "react";

import DynamicBottomNavigation from "@/cms/components/DynamicBottomNavigation";

import dynamicThemeRuntime from "@/cms/runtime/dynamicThemeRuntime";

function CustomerAppShell({
  children,
}) {

  useEffect(() => {

    dynamicThemeRuntime
      .applyTheme();

  }, []);

  return (

    <div
      className="
        min-h-screen
        bg-black
        pb-24
      "
    >

      {children}

      <DynamicBottomNavigation />

    </div>

  );

}

export default
  CustomerAppShell;