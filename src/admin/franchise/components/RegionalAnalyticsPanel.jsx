function RegionalAnalyticsPanel({
  analytics,
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
        Regional Analytics
      </div>

      <pre
        className="
          overflow-auto
          text-sm
        "
      >

        {

          JSON.stringify(
            analytics,
            null,
            2
          )

        }

      </pre>

    </div>

  );

}

export default
  RegionalAnalyticsPanel;