function DynamicCmsRenderer({
  sections = [],
}) {

  return (

    <div
      className="
        grid
        gap-5
      "
    >

      {
        sections.map(
          (
            section
          ) => (

            <div
              key={
                section.id
              }
            >

              {
                section.type ===
                "hero" && (

                  <div
                    className="
                      rounded-3xl
                      bg-zinc-900
                      p-6
                      text-white
                    "
                  >

                    <div
                      className="
                        text-3xl
                        font-black
                      "
                    >
                      {
                        section.title
                      }
                    </div>

                    <div
                      className="
                        mt-2
                        text-sm
                        opacity-70
                      "
                    >
                      {
                        section.description
                      }
                    </div>

                  </div>

                )
              }

            </div>

          )
        )
      }

    </div>

  );

}

export default
  DynamicCmsRenderer;