function RealtimeMetricCard({

  label,

  value,

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
          text-sm
          text-white/60
        "
      >
        {label}
      </div>

      <div
        className="
          mt-3
          text-3xl
          font-black
        "
      >
        {value}
      </div>

    </div>

  );

}

export default
  RealtimeMetricCard;