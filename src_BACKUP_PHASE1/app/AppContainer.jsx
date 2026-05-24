function AppContainer({
  children,
}) {

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[640px]
      "
    >
      {children}
    </div>
  );

}

export default
  AppContainer;