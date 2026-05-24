function AppContainer({ children }) {
  return (
    <div
      style={{
        height: "var(--app-height, 100dvh)",
        paddingTop: "var(--app-safe-top, 0px)",
        paddingLeft: "var(--safe-left, 0px)",
        paddingRight: "var(--safe-right, 0px)",
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorY: "contain",
        background: "var(--app-background, #f6f1e7)",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
export default AppContainer;
