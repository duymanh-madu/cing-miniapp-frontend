function IposStatusCard({
  status,
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
          text-sm
          text-white/60
        "
      >
        iPOS Connection
      </div>

      <div
        className="
          mt-3
          text-3xl
          font-black
        "
      >
        {status?.state}
      </div>

      <div
        className="
          mt-2
          text-xs
          text-white/40
        "
      >
        Last Sync:
        {" "}
        {status?.lastSync}
      </div>

    </div>

  );

}

export default
  IposStatusCard;