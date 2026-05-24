function Heading({
  children,
  className = "",
}) {

  return (
    <h2
      className={`
        text-2xl
        font-black
        tracking-tight

        ${className}
      `}
    >
      {children}
    </h2>
  );

}

export default
  Heading;