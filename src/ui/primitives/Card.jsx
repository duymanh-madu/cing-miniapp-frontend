function Card({
  children,
  className = "",
}) {

  return (
    <div
      className={`
        rounded-3xl
        bg-white
        shadow-sm

        ${className}
      `}
    >
      {children}
    </div>
  );

}

export default
  Card;