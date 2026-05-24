export default function StreakToast({

  toast,

}) {

  return (

    <div
      className="

        px-5
        py-4

        rounded-3xl

        bg-black
        text-orange-400

        border
        border-orange-400

        shadow-2xl

      "
    >

      <div
        className="

          text-xs
          uppercase
          font-bold

        "
      >

        Daily Streak

      </div>

      <div
        className="

          text-2xl
          font-black

          mt-1

        "
      >

        🔥 {toast.days} Days

      </div>

    </div>

  );

}