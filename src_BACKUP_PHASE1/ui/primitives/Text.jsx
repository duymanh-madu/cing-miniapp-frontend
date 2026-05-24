function Text({
  children,
  className = "",
}) {

  return (
    <p
      className={`
        text-sm
        text-gray-700

        ${className}
      `}
    >
      {children}
    </p>
  );

}

export default
  Text;