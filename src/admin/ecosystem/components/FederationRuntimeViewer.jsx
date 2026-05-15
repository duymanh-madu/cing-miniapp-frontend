function FederationRuntimeViewer({
  federationRuntime,
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
        App Federation Runtime
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
            federationRuntime,
            null,
            2
          )

        }

      </pre>

    </div>

  );

}

export default
  FederationRuntimeViewer;