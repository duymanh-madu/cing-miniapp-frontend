function VisualNodeEditor({
  nodes = [],
}) {

  return (

    <div
      className="
        rounded-3xl
        bg-white/5
        p-5
      "
    >

      <div
        className="
          mb-5
          text-2xl
          font-black
        "
      >
        Visual Runtime Nodes
      </div>

      <div
        className="
          space-y-3
        "
      >

        {

          nodes.map(
            (
              node,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  bg-black/40
                  p-4
                "
              >

                <div
                  className="
                    text-lg
                    font-bold
                  "
                >
                  {node.type}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {node.id}
                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default
  VisualNodeEditor;