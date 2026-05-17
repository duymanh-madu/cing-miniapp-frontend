export default function MissionToast({

  toast,

}) {

  return (

    <div
      className="

        px-5
        py-4

        rounded-3xl

        bg-blue-500
        text-white

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

        Mission Complete

      </div>

      <div
        className="

          text-lg
          font-black

          mt-1

        "
      >

        🏆 {toast.message}

      </div>

    </div>

  );

}