function SchemaRuntimeViewer({
  runtimeSchema,
}) {

  return (

    <div
      className="
        rounded-3xl
        bg-black
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
        Runtime Schema
      </div>

      <pre
        className="
          overflow-auto
          text-sm
          text-green-400
        "
      >

        {

          JSON.stringify(
            runtimeSchema,
            null,
            2
          )

        }

      </pre>

    </div>

  );

}

export default
  SchemaRuntimeViewer;