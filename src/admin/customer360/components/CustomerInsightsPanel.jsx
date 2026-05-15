function CustomerInsightsPanel({
  insights,
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
          text-2xl
          font-black
        "
      >
        Customer Insights
      </div>

      <pre
        className="
          mt-5
          overflow-auto
          text-sm
        "
      >

        {

          JSON.stringify(
            insights,
            null,
            2
          )

        }

      </pre>

    </div>

  );

}

export default
  CustomerInsightsPanel;