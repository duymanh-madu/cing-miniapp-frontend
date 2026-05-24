function Button({
  children,
  className = "",
  ...props
}) {

  return (
    <button
      className={`
        rounded-2xl
        bg-black
        px-4
        py-3
        text-sm
        font-bold
        text-white
        transition-all
        active:scale-[0.98]

        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );

}

export default
  Button;