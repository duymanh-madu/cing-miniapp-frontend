function PageCard({
  page,
  onSelect,
}) {

  return (

    <button
      onClick={() =>
        onSelect(page)
      }

      className="
        w-full
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
        text-left
      "
    >

      <div
        className="
          text-xl
          font-black
        "
      >
        {page.name}
      </div>

      <div
        className="
          mt-2
          text-sm
          text-white/60
        "
      >
        {page.slug}
      </div>

      <div
        className="
          mt-4
          text-xs
          text-white/40
        "
      >
        Last Deploy:
        {" "}
        {page.lastDeploy}
      </div>

    </button>

  );

}

export default
  PageCard;