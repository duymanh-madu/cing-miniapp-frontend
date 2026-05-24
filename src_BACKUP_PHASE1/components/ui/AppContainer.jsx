function AppContainer({
  children,
}) {
  return (

    <div
      className="
        app-container
      "
      style={{
        minHeight:
          "var(--app-height, 100dvh)",

        paddingTop:
          "var(--app-safe-top)",

        paddingBottom:
          "var(--bottom-nav-safe-height)",

        paddingLeft:
          "var(--safe-left)",

        paddingRight:
          "var(--safe-right)",

        overflowX:
          "hidden",

        background:
          "var(--app-background, #f6f1e7)",
      }}
    >

      {children}

    </div>

  );
}

export default
  AppContainer;
