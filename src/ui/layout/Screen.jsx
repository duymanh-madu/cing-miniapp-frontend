function Screen({
  children,
  className = "",
}) {

  return (
    <div
      className={`
        px-4
        pb-24
        pt-4

        ${className}
      `}
    >
      {children}
    </div>
  );

}

export default
  Screen;