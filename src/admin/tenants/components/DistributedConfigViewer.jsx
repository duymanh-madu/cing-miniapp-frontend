function DistributedConfigViewer({
  distributedConfig,
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
        Distributed Runtime Config
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
            distributedConfig,
            null,
            2
          )

        }

      </pre>

    </div>

  );

}

export default
  DistributedConfigViewer;