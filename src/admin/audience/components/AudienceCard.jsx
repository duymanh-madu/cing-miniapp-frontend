function AudienceCard({
  audience,
}) {

  return (

    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
      "
    >

      <div
        className="
          text-xl
          font-black
        "
      >
        {audience.name}
      </div>

      <div
        className="
          mt-2
          text-sm
          text-white/60
        "
      >
        {audience.description}
      </div>

      <div
        className="
          mt-5
          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            text-xs
            text-white/40
          "
        >
          Members
        </div>

        <div
          className="
            text-lg
            font-black
          "
        >
          {audience.memberCount}
        </div>

      </div>

    </div>

  );

}

export default
  AudienceCard;