function PageHeading({
  title,
  subtitle,
}) {
  return (

    <div>

      <h1
        className="
          text-[32px]
          font-black
          tracking-tight
          text-[#111827]
        "
      >
        {title}
      </h1>

      {

        subtitle && (

          <p
            className="
              mt-2
              text-sm
              text-[#6b7280]
            "
          >
            {subtitle}
          </p>

        )

      }

    </div>

  );
}

export default
  PageHeading;