function CustomerProfileCard({
  profile,
  onSelect,
}) {

  return (

    <button
      onClick={() =>
        onSelect(profile)
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
        {profile.name}
      </div>

      <div
        className="
          mt-2
          text-sm
          text-white/60
        "
      >
        {profile.phone}
      </div>

      <div
        className="
          mt-4
          flex
          gap-2
        "
      >

        {

          profile.tags?.map(
            (
              tag
            ) => (

              <div
                key={tag}
                className="
                  rounded-full
                  bg-black/40
                  px-3
                  py-1
                  text-xs
                "
              >
                {tag}
              </div>

            )
          )

        }

      </div>

    </button>

  );

}

export default
  CustomerProfileCard;