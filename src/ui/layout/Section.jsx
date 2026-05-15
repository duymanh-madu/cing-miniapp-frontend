function Section({
  children,
  className = "",
}) {

  return (
    <section
      className={`
        mt-8

        ${className}
      `}
    >
      {children}
    </section>
  );

}

export default
  Section;