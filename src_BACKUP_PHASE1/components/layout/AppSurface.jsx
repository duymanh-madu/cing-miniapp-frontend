function AppSurface({
  children,
}) {

  return (

    <main
      className="
        min-h-[var(--app-height)]
        bg-[#f8f8f8]
        pb-[120px]
      "
    >

      {children}

    </main>

  );

}

export default
  AppSurface;