import {
  useEffect,
} from "react";

import dynamicThemeRuntime
  from "@/cms/runtime/dynamicThemeRuntime";

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

    </div>

  );

}

export default
  CustomerAppShell;