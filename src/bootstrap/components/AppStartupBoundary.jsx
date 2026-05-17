import SafeRenderBoundary from "@/stability/components/SafeRenderBoundary";

function AppStartupBoundary({

  children,

}) {

  return (

    <SafeRenderBoundary>

      {children}

    </SafeRenderBoundary>

  );

}

export default AppStartupBoundary;